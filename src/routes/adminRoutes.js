const express = require('express');
const { getOverviewStats, sendAdminMessage } = require('../controllers/adminController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, isAdmin, getOverviewStats);
router.get('/settings', protect, isAdmin, getSettings);
router.put('/settings', protect, isAdmin, updateSettings);
router.post('/messages', protect, isAdmin, sendAdminMessage);

module.exports = router;
