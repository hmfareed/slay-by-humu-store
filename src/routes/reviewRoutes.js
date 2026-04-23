const express = require('express');
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.route('/:productId')
  .get(getProductReviews)
  .post(protect, upload.array('images', 3), createReview);

module.exports = router;
