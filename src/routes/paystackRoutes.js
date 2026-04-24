const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, paystackWebhook } = require('../controllers/paystackController');
const { protect } = require('../middleware/auth');

// Webhook must use raw body — Paystack signature verification requires it.
// This route is public but secured by HMAC signature.
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

// Protected payment routes
router.post('/initialize', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);

module.exports = router;
