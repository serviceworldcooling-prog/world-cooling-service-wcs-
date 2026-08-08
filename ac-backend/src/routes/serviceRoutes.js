const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getServices, getCategories, getServiceById, createService, updateService, deleteService, getPublicTechnicians } = require('../controllers/serviceController');

// Public routes — no auth needed to browse services
router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/technicians', getPublicTechnicians);
router.get('/:id', getServiceById);

// Admin routes for service management
router.post('/', protect, restrictTo('admin'), createService);
router.put('/:id', protect, restrictTo('admin'), updateService);
router.delete('/:id', protect, restrictTo('admin'), deleteService);

module.exports = router;
