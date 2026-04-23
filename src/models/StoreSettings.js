const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  // Store Info
  storeName: { type: String, default: 'Slay By Humu' },
  logo: { type: String, default: '' },
  currency: { type: String, default: 'GHS' },
  currencySymbol: { type: String, default: '₵' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },

  // Delivery
  deliveryFee: { type: Number, default: 0 },
  deliveryRegions: [{ type: String }],
  estimatedDeliveryTime: { type: String, default: '3-5 business days' },

  // Payment Methods
  paymentMethods: [{
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    apiKey: { type: String, default: '' },
  }],

  // Notifications
  notifications: {
    newOrder: { type: Boolean, default: true },
    statusUpdate: { type: Boolean, default: true },
  }
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
