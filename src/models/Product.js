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
  texture: {
    type: String,
    default: 'Raw, Unprocessed'
  },
  lace: {
    type: String,
    default: 'Ultra-Thin HD'
  },
  longevity: {
    type: String,
    default: '2-3+ Years'
  },
  styling: {
    type: String,
    default: 'Takes Bleach & Heat'
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