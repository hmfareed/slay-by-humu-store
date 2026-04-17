const Address = require('../models/Address');

// GET /api/addresses — Get all addresses for user
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/addresses — Create new address
const createAddress = async (req, res) => {
  try {
    const { name, phone, region, city, street, gpsAddress, isDefault } = req.body;
    
    if (!name || !phone || !region || !city || !street) {
      return res.status(400).json({ message: 'Name, phone, region, city, and street are required' });
    }

    const address = await Address.create({
      user: req.user.id, name, phone, region, city, street,
      gpsAddress: gpsAddress || '',
      isDefault: isDefault || false
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/addresses/:id — Update address
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    Object.assign(address, req.body);
    await address.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/addresses/:id — Delete address
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/addresses/:id/default — Set as default
const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    address.isDefault = true;
    await address.save(); // pre-save hook handles unsetting others
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress };
