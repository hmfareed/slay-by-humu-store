const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');
const { createNotification } = require('./notificationController');
const { tokenMatches } = require('../utils/orderAccess');

const getPaystackSecret = () => (process.env.PAYSTACK_SECRET_KEY || '').trim();
const PAYSTACK_BASE = 'https://api.paystack.co';

const getFrontendOrigin = () => {
  const raw = (process.env.FRONTEND_URL || 'http://localhost:3000').trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith('localhost') || raw.startsWith('127.0.0.1') ? `http://${raw}` : `https://${raw}`;
};

// @desc    Initialize a Paystack payment for an existing order
// @route   POST /api/payments/initialize
// @access  Order owner (JWT) or guest holding the order access token
const initializePayment = async (req, res) => {
  try {
    const { orderId, guestToken } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!/^[a-f\d]{24}$/i.test(String(orderId || ''))) {
      return res.status(400).json({ message: 'Invalid order' });
    }

    const order = await Order.findById(orderId).select('+accessTokenHash');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order owner (account) or the guest holding the access token can pay
    const isOwner = !!(userId && order.user && order.user.toString() === userId);
    const isGuestHolder = !order.user && tokenMatches(guestToken, order.accessTokenHash);
    if (!isOwner && !isGuestHolder) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This order is already paid' });
    }

    // ── Paystack fee pass-through ────────────────────────────────────────────
    // Paystack Ghana charges 1.95% per transaction (no flat fee for GHS).
    // To ensure the store always nets the full product total, we calculate the
    // gross amount the customer must pay using the inverse formula:
    //   chargedAmount = productTotal / (1 - 0.0195)
    // After Paystack deducts its 1.95%, the merchant receives exactly productTotal.
    const PAYSTACK_RATE = 0.0195;
    const productTotal = order.totalAmount;
    const chargedAmount = parseFloat((productTotal / (1 - PAYSTACK_RATE)).toFixed(2));
    const processingFee = parseFloat((chargedAmount - productTotal).toFixed(2));

    // Paystack requires amount in smallest currency unit (pesewas for GHS)
    const amountInPesewas = Math.round(chargedAmount * 100);

    // Persist fee details on the order for accounting / admin visibility
    order.processingFee = processingFee;
    order.chargedAmount = chargedAmount;

    // Resolve the payer's email/name: account holder or guest contact details
    let payerEmail;
    let payerName;
    if (isOwner) {
      const User = require('../models/User');
      const user = await User.findById(userId).select('email name');
      if (!user) return res.status(404).json({ message: 'User not found' });
      payerEmail = user.email;
      payerName = user.name;
    } else {
      payerEmail = order.guest.email;
      payerName = order.guest.name;
    }

    const paystackRes = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email: payerEmail,
        // Gross amount — after Paystack's 1.95% fee the store nets productTotal
        amount: amountInPesewas,
        currency: 'GHS',
        reference: `SBH-${orderId}-${Date.now()}`,
        metadata: {
          orderId: orderId.toString(),
          userId: userId ? userId.toString() : 'guest',
          orderNumber: order.orderNumber || '',
          customerName: payerName,
          productTotal: productTotal.toFixed(2),
          processingFee: processingFee.toFixed(2),
          chargedAmount: chargedAmount.toFixed(2),
        },
        callback_url: `${getFrontendOrigin()}/checkout/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${getPaystackSecret()}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { authorization_url, access_code, reference } = paystackRes.data.data;

    // Save the reference on the order so we can verify it later
    order.paystackReference = reference;
    order.paymentMethod = 'Paystack';
    await order.save();

    res.json({
      authorization_url,
      access_code,
      reference,
      orderId,
      processingFee,
      chargedAmount,
    });
  } catch (error) {
    console.error('Paystack initialize error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initialize payment', error: error.response?.data?.message || error.message });
  }
};

// @desc    Verify a Paystack payment by reference
// @route   GET /api/payments/verify/:reference
// @access  Public — only confirms with Paystack and returns non-sensitive status
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const paystackRes = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${getPaystackSecret()}` },
      }
    );

    const { status, metadata, amount } = paystackRes.data.data;

    if (status !== 'success') {
      return res.status(400).json({ message: `Payment not successful. Status: ${status}` });
    }

    const orderId = metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({ message: 'No orderId found in payment metadata' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Associated order not found' });
    }

    // Defense in depth: the amount actually paid must cover what we charged
    if (order.chargedAmount && amount < Math.round(order.chargedAmount * 100)) {
      console.warn(`⚠️ Underpayment for order ${orderId}: paid ${amount}, expected ${Math.round(order.chargedAmount * 100)}`);
      return res.status(400).json({ message: 'Payment amount does not match order total' });
    }

    // Idempotency — don't update if already marked paid
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'processing'; // Move from pending → processing on successful payment
      await order.save();

      // Notify the customer (guest orders have no account to notify)
      if (order.user) {
        await createNotification(
          order.user,
          'Payment Confirmed ✅',
          `Your payment of ₵${(amount / 100).toFixed(2)} was successful! Your order is now being processed.`,
          'order',
          null
        );
      }
    }

    res.json({
      message: 'Payment verified successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        isGuest: !order.user,
      },
    });
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Payment verification failed', error: error.response?.data?.message || error.message });
  }
};

// @desc    Paystack webhook — handles charge.success & refund events
// @route   POST /api/payments/webhook
// @access  Public (secured by signature)
const paystackWebhook = async (req, res) => {
  const signature = req.headers['x-paystack-signature'];

  // Validate the webhook signature using HMAC SHA-512
  const hash = crypto
    .createHmac('sha512', getPaystackSecret())
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    console.warn('⚠️ Invalid Paystack webhook signature — rejected');
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const { event, data } = req.body;
  console.log(`📦 Paystack Webhook received: ${event}`);

  try {
    if (event === 'charge.success') {
      const { reference, metadata, amount } = data;
      const orderId = metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.chargedAmount && amount < Math.round(order.chargedAmount * 100)) {
          console.warn(`⚠️ Webhook underpayment for order ${orderId}: paid ${amount}`);
        } else if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          await order.save();

          if (order.user) {
            await createNotification(
              order.user,
              'Payment Confirmed ✅',
              `Your payment of ₵${(amount / 100).toFixed(2)} was successful! Your order is now being processed.`,
              'order',
              null
            );
          }

          console.log(`✅ Order ${orderId} marked as paid via webhook`);
        }
      }
    }

    if (event === 'refund.processed') {
      const { metadata } = data;
      const orderId = metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'refunded';
          await order.save();

          if (order.user) {
            await createNotification(
              order.user,
              'Refund Processed 💰',
              `A refund for your order has been successfully processed.`,
              'order',
              null
            );
          }

          console.log(`↩️ Order ${orderId} marked as refunded via webhook`);
        }
      }
    }

    // Always respond 200 to Paystack to acknowledge receipt
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.sendStatus(200); // Still return 200 to prevent Paystack retries
  }
};

module.exports = { initializePayment, verifyPayment, paystackWebhook };
