const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, isAdmin, createCategory);

module.exports = router;
