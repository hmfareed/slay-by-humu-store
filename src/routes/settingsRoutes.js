const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/settings', protect, isAdmin, getSettings);
router.put('/settings', protect, isAdmin, updateSettings);

module.exports = router;
