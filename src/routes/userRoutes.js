const express = require('express');
const multer = require('multer');
const { registerUser, loginUser, getMe, updateProfile, changePassword, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.put('/me/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;