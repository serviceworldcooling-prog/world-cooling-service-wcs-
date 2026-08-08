const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createProduct, getProducts, getProductById, deleteProduct, updateProduct } = require('../controllers/productController');

// Public — anyone can browse listings
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected — must be logged in to post or delete a listing
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
