const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { createNotification } = require('./notificationController');

const createOrder = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { shippingAddress, paymentMethod, items } = req.body;

    let orderItems = [];
    let totalAmount = 0;

    if (userId) {
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (cart && cart.items.length > 0) {
        for (const item of cart.items) {
          if (!item.product) continue;
          const price = item.product.price;
          totalAmount += price * item.quantity;
          orderItems.push({
            product: item.product._id,
            quantity: item.quantity,
            price: price
          });
        }
      }
    }

    if (orderItems.length === 0 && items && items.length > 0) {
      // Guest Checkout or specific items sent
      for (const item of items) {
        totalAmount += item.price * item.quantity;
        orderItems.push({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        });
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'No valid products in cart' });
    }

    const order = await Order.create({
      user: userId || undefined, // Guest orders won't have a user
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
    });

    // Clear cart if user is logged in
    if (userId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ message: error.message });
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
    
    // Allow admin or order owner to view
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
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

    // Trigger detailed notification
    await createNotification(
      order.user,
      notificationTitle,
      notificationMessage,
      'order',
      req.app.get('io')
    );

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

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
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

const deleteAllOrders = async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: "All orders have been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders, cancelOrder, deleteAllOrders };