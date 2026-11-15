const express = require('express');
const { 
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
} = require('../controllers/orderController');
const { protect, isAdmin, optionalAuth } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const createOrderLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many orders from this device. Please try again later.' });
const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many lookup attempts. Please try again later.' });

router.post('/', createOrderLimiter, optionalAuth, createOrder);

// Guest order tracking (public, rate limited)
router.get('/track/:token', trackLimiter, trackOrderByToken);
router.post('/track', trackLimiter, lookupGuestOrder);

router.use(protect);

router.post('/claim', claimGuestOrder);
router.get('/', getMyOrders);
router.get('/all', isAdmin, getAllOrders);
router.delete('/all', isAdmin, deleteAllOrders);
router.get('/:id', getOrderById);
router.delete('/:id', isAdmin, deleteOrder);
router.put('/:id/status', isAdmin, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
