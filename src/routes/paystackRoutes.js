const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, paystackWebhook } = require('../controllers/paystackController');
const { optionalAuth } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');

const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many payment attempts. Please try again later.' });

// Webhook must use raw body — Paystack signature verification requires it.
// This route is public but secured by HMAC signature.
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

// Owner (JWT) or guest (order access token) can initialize payment
router.post('/initialize', paymentLimiter, optionalAuth, initializePayment);
// Verification only confirms with Paystack and returns non-sensitive status
router.get('/verify/:reference', paymentLimiter, verifyPayment);

module.exports = router;
