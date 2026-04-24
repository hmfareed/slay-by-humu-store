const express = require('express');
const { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders, cancelOrder, deleteAllOrders } = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', createOrder);

router.use(protect);

router.get('/', getMyOrders);
router.get('/all', isAdmin, getAllOrders);
router.delete('/all', isAdmin, deleteAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', isAdmin, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;