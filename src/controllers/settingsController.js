const StoreSettings = require('../models/StoreSettings');

// @desc    Get store settings (creates default if none exist)
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await StoreSettings.create({
        storeName: 'Slay By Humu',
        currency: 'GHS',
        currencySymbol: '₵',
        deliveryRegions: ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern'],
        paymentMethods: [
          { name: 'Mobile Money', enabled: true },
          { name: 'Card Payment', enabled: false },
          { name: 'Cash on Delivery', enabled: true },
        ],
        notifications: { newOrder: true, statusUpdate: true },
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update store settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = await StoreSettings.create(req.body);
    } else {
      // Merge updates
      Object.keys(req.body).forEach(key => {
        settings[key] = req.body[key];
      });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
