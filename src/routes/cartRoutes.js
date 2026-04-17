const express = require('express');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');   // ← Must be destructured like this

const router = express.Router();

router.use(protect);   // All cart routes require login

router.post('/', addToCart);
router.get('/', getCart);
router.delete('/:productId', removeFromCart);

module.exports = router;