const express = require('express');
const { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders, cancelOrder } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/all', isAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', isAdmin, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;