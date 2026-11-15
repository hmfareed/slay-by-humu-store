const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'picked_up', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    phoneNumber: { type: String, required: false }
  },
  paystackReference: {
    type: String,
    sparse: true
  },
  // The Paystack processing fee (1.95%) added on top and paid by the customer
  processingFee: {
    type: Number,
    default: 0
  },
  // The gross amount charged to the customer (totalAmount + processingFee)
  chargedAmount: {
    type: Number,
    default: 0
  },
  // Human-friendly order number shown to customers (e.g. SBH-7K3F9QXM)
  orderNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  // Contact details for guest (no-account) orders
  guest: {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true }
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  // SHA-256 hash of the guest's order access token (raw token is never stored)
  accessTokenHash: {
    type: String,
    select: false,
    index: true
  }
}, { timestamps: true });

// Every order must belong to either a registered user or a guest with an email
orderSchema.pre('validate', function (next) {
  if (this.paystackReference === null) {
    this.paystackReference = undefined;
  }
  if (!this.user && !(this.guest && this.guest.email)) {
    this.invalidate('guest.email', 'Guest orders require an email address');
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);