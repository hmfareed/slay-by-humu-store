const express = require('express');
const { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefaultAddress);

module.exports = router;
