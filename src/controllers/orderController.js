const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { createNotification } = require('./notificationController');
const {
  generateOrderNumber,
  generateAccessToken,
  hashToken,
  EMAIL_REGEX,
} = require('../utils/orderAccess');

const MAX_QTY_PER_ITEM = 50;

// Build order line items from product IDs + quantities, ALWAYS pricing from the DB.
// Client-supplied prices are ignored to prevent price tampering.
const buildOrderItems = async (requested) => {
  // Merge duplicate product lines
  const qtyById = new Map();
  for (const item of requested) {
    const id = String(item.product || '');
    const qty = Number(item.quantity);
    if (!/^[a-f\d]{24}$/i.test(id)) throw { status: 400, message: 'Invalid product in order' };
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      throw { status: 400, message: 'Invalid quantity in order' };
    }
    qtyById.set(id, (qtyById.get(id) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...qtyById.keys()] } }).select('name price isSoldOut');
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let totalAmount = 0;
  for (const [id, quantity] of qtyById) {
    const product = byId.get(id);
    if (!product) throw { status: 400, message: 'One or more products are no longer available' };
    if (product.isSoldOut) throw { status: 400, message: `${product.name} is sold out` };
    totalAmount += product.price * quantity;
    orderItems.push({ product: product._id, quantity, price: product.price });
  }

  return { orderItems, totalAmount: parseFloat(totalAmount.toFixed(2)) };
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { shippingAddress, items, guest } = req.body;

    // Guests must provide contact details (email is required for Paystack + order lookup)
    let guestInfo;
    if (!userId) {
      const name = String(guest?.name || '').trim();
      const email = String(guest?.email || '').trim().toLowerCase();
      const phone = String(guest?.phone || shippingAddress?.phoneNumber || '').trim();
      if (!name || !EMAIL_REGEX.test(email) || phone.length < 10) {
        return res.status(400).json({ message: 'Please provide your name, a valid email and phone number' });
      }
      guestInfo = { name: name.slice(0, 100), email: email.slice(0, 254), phone: phone.slice(0, 30) };
    }

    // Prefer the authenticated user's server-side cart; otherwise use the submitted items
    let requested = [];
    if (userId) {
      const cart = await Cart.findOne({ user: userId });
      if (cart && cart.items.length > 0) {
        requested = cart.items.map((i) => ({ product: i.product, quantity: i.quantity }));
      }
    }
    if (requested.length === 0 && Array.isArray(items)) {
      requested = items;
    }
    if (requested.length === 0) {
      return res.status(400).json({ message: 'No valid products in cart' });
    }

    const { orderItems, totalAmount } = await buildOrderItems(requested);

    const rawAccessToken = userId ? null : generateAccessToken();

    const order = await Order.create({
      user: userId || undefined,
      guest: guestInfo,
      isGuest: !userId,
      accessTokenHash: rawAccessToken ? hashToken(rawAccessToken) : undefined,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      totalAmount,
      shippingAddress,
      // Paystack is the only supported payment method for now
      paymentMethod: 'Paystack',
    });

    // Clear cart if user is logged in
    if (userId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }

    const orderJson = order.toObject();
    delete orderJson.accessTokenHash;

    res.status(201).json({
      message: "Order placed successfully",
      order: orderJson,
      // Returned exactly once; the guest needs it to pay for and track this order
      ...(rawAccessToken ? { guestToken: rawAccessToken } : {}),
    });
  } catch (error) {
    if (error && error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    console.error("Order Error:", error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id — Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Allow admin or order owner to view (guest orders have no owner account)
    const ownerId = order.user ? order.user._id.toString() : null;
    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/orders/:id/status — Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Normalize to lowercase for DB storage
    const normalizedStatus = status.toLowerCase();
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: `Invalid status. Must be: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = normalizedStatus;
    
    // Auto-update payment status when delivered
    if (normalizedStatus === 'delivered') {
      order.paymentStatus = 'paid';
    }
    
    await order.save();

    // Fetch the populated order specifically for the notification string
    const populatedOrder = await Order.findById(req.params.id).populate('items.product', 'name');

    // Generate detailed item string for notification
    const itemNames = populatedOrder.items
      .map(item => item.product ? item.product.name : 'Unknown Item')
      .join(', ');

    let notificationTitle = `Order ${normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}`;
    let notificationMessage = `Great news! Your order containing [${itemNames}] has been marked as ${normalizedStatus}. We'll keep you posted on the progress.`;

    if (normalizedStatus === 'cancelled') {
      notificationMessage = `Your order containing [${itemNames}] has been cancelled.`;
    }

    // Trigger detailed notification (guest orders have no account to notify)
    if (order.user) {
      await createNotification(
        order.user,
        notificationTitle,
        notificationMessage,
        'order',
        req.app.get('io')
      );
    }

    res.json({ message: `Order status updated to ${normalizedStatus}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/all — Admin: Get all orders with filters
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, fromDate, toDate } = req.query;
    
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus.toLowerCase();
    }
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const ownerId = order.user ? order.user.toString() : null;
    if (ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to perform this operation' });
    }

    // Only allow cancellation if pending or processing
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ message: `Cannot cancel an order that is ${order.status}` });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete single order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete all orders
// @route   DELETE /api/orders/all
// @access  Private/Admin
const deleteAllOrders = async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: "All orders have been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public-safe view of an order for guest tracking (no internal fields)
const toTrackingView = (order) => ({
  _id: order._id,
  orderNumber: order.orderNumber,
  status: order.status,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  totalAmount: order.totalAmount,
  processingFee: order.processingFee,
  chargedAmount: order.chargedAmount,
  shippingAddress: order.shippingAddress,
  guest: order.guest ? { name: order.guest.name } : undefined,
  isClaimed: !!order.user,
  createdAt: order.createdAt,
  items: order.items.map((i) => ({
    quantity: i.quantity,
    price: i.price,
    product: i.product
      ? { _id: i.product._id, name: i.product.name, images: (i.product.images || []).slice(0, 1) }
      : null,
  })),
});

// @desc    Guest: view an order using its access token
// @route   GET /api/orders/track/:token
// @access  Public (possession of token)
const trackOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!/^[a-f\d]{64}$/i.test(token || '')) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findOne({ accessTokenHash: hashToken(token) })
      .populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(toTrackingView(order));
  } catch (error) {
    res.status(500).json({ message: 'Failed to load order' });
  }
};

// @desc    Guest: look up an order by order number + email used at checkout
// @route   POST /api/orders/track
// @access  Public (rate limited)
const lookupGuestOrder = async (req, res) => {
  try {
    const orderNumber = String(req.body.orderNumber || '').trim().toUpperCase();
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!orderNumber || !email) {
      return res.status(400).json({ message: 'Order number and email are required' });
    }
    const order = await Order.findOne({ orderNumber, isGuest: true, 'guest.email': email })
      .populate('items.product', 'name images');
    // Same response whether the number or the email is wrong
    if (!order) return res.status(404).json({ message: 'No order matches those details' });
    res.json(toTrackingView(order));
  } catch (error) {
    res.status(500).json({ message: 'Failed to look up order' });
  }
};

// @desc    Attach a guest order to the logged-in account (proved by access token)
// @route   POST /api/orders/claim
// @access  Private
const claimGuestOrder = async (req, res) => {
  try {
    const { token } = req.body;
    if (!/^[a-f\d]{64}$/i.test(token || '')) {
      return res.status(400).json({ message: 'Invalid order token' });
    }
    const order = await Order.findOneAndUpdate(
      { accessTokenHash: hashToken(token), user: null },
      { $set: { user: req.user.id } },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found or already linked to an account' });
    }
    res.json({ message: 'Order linked to your account', orderId: order._id, orderNumber: order.orderNumber });
  } catch (error) {
    res.status(500).json({ message: 'Failed to link order' });
  }
};

module.exports = { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  updateOrderStatus, 
  getAllOrders, 
  cancelOrder, 
  deleteOrder,
  deleteAllOrders,
  trackOrderByToken,
  lookupGuestOrder,
  claimGuestOrder,
};
