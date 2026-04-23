const express = require('express');
const multer = require('multer');
const { registerUser, loginUser, getMe, updateProfile, changePassword, uploadAvatar, getAllUsers, getUserById, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: '/tmp/uploads/' });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.put('/me/avatar', protect, upload.single('avatar'), uploadAvatar);

// Admin routes
router.get('/', protect, isAdmin, getAllUsers);
router.get('/:id', protect, isAdmin, getUserById);
router.put('/:id/status', protect, isAdmin, toggleUserStatus);
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;