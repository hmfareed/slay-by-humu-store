const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');
const { createNotification } = require('./notificationController');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = 'https://api.paystack.co';

// @desc    Initialize a Paystack payment for an existing order
// @route   POST /api/payments/initialize
// @access  Private
const initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order owner can pay
    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This order is already paid' });
    }

    // Paystack requires amount in smallest currency unit (pesewas for GHS)
    const amountInPesewas = Math.round(order.totalAmount * 100);

    // Get user email from the decoded JWT token
    const User = require('../models/User');
    const user = await User.findById(userId).select('email name');

    const paystackRes = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email: user.email,
        amount: amountInPesewas,
        currency: 'GHS',
        reference: `SBH-${orderId}-${Date.now()}`,
        metadata: {
          orderId: orderId.toString(),
          userId: userId.toString(),
          customerName: user.name,
        },
        callback_url: `${process.env.FRONTEND_URL}/checkout/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
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
    });
  } catch (error) {
    console.error('Paystack initialize error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initialize payment', error: error.response?.data?.message || error.message });
  }
};

// @desc    Verify a Paystack payment by reference
// @route   GET /api/payments/verify/:reference
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const paystackRes = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
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

    // Idempotency — don't update if already marked paid
    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'processing'; // Move from pending → processing on successful payment
      await order.save();

      // Notify the customer
      await createNotification(
        order.user,
        'Payment Confirmed ✅',
        `Your payment of ₵${(amount / 100).toFixed(2)} was successful! Your order is now being processed.`,
        'order',
        null
      );
    }

    res.json({
      message: 'Payment verified successfully',
      order: {
        _id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
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
    .createHmac('sha512', PAYSTACK_SECRET)
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
        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          await order.save();

          await createNotification(
            order.user,
            'Payment Confirmed ✅',
            `Your payment of ₵${(amount / 100).toFixed(2)} was successful! Your order is now being processed.`,
            'order',
            null
          );

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

          await createNotification(
            order.user,
            'Refund Processed 💰',
            `A refund for your order has been successfully processed.`,
            'order',
            null
          );

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
