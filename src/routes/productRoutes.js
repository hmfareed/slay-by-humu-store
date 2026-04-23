const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const multer = require('multer');
const { protect, isAdmin } = require('../middleware/auth');

const upload = multer({ dest: '/tmp/uploads/' });

const router = express.Router();

// Public routes - anyone can view
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only - create product with images
router.post('/', protect, isAdmin, upload.array('images', 5), createProduct);
router.put('/:id', protect, isAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;