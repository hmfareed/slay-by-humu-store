const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Review = require('../src/models/Review');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

// Environment safeguard
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_MUTATIONS !== 'true') {
  console.error('⛔ Refusing to run testReview in production without ALLOW_TEST_MUTATIONS=true');
  process.exit(1);
}

const testReview = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // get any product
    const product = await Product.findOne();
    if (!product) {
      console.log('No products found');
      return;
    }
    
    // get any user
    const user = await User.findOne();
    if (!user) {
      console.log('No users found');
      return;
    }

    console.log(`Testing review for product ${product._id} and user ${user._id}`);
    
    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ product: product._id, user: user._id });
    if (alreadyReviewed) {
      console.log('Already reviewed, deleting...');
      await Review.deleteOne({ _id: alreadyReviewed._id });
    }

    const review = await Review.create({
      product: product._id,
      user: user._id,
      rating: 5,
      comment: 'Test comment',
      images: []
    });

    console.log('Review created:', review);
    
  } catch (error) {
    console.error('Error creating review:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testReview();
