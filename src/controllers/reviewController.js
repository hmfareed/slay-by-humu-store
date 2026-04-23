const Review = require('../models/Review');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Create a new review
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ product: productId, user: userId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'reviews' });
        imageUrls.push(result.secure_url);
      }
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment,
      images: imageUrls
    });

    // Update Product average rating
    const product = await Product.findById(productId);
    const totalReviews = await Review.find({ product: productId });
    
    product.numReviews = totalReviews.length;
    product.averageRating = totalReviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews.length;
    await product.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews
};
