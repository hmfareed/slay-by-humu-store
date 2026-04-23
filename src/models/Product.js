const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  category: { type: String, required: true },
  stock: { 
    type: Number, 
    default: 0 
  },
  images: [{ 
    type: String 
  }],           // Cloudinary image URLs
  brand: { 
    type: String 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);