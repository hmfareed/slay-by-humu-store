const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  region: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  gpsAddress: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

// Ensure only one default per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('Address', addressSchema);
