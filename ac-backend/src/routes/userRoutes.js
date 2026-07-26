const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All user routes require auth
router.use(protect);

// ── Profile ──────────────────────────────────────────
router.get('/profile', getProfile);

router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  ],
  validate,
  updateProfile
);

// ── Addresses ─────────────────────────────────────────
router.get('/addresses', getAddresses);

router.post(
  '/addresses',
  [
    body('label').trim().notEmpty().withMessage('Address label is required (e.g. Home, Office)'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('lat').optional().isFloat().withMessage('Latitude must be a number'),
    body('lng').optional().isFloat().withMessage('Longitude must be a number'),
    body('isDefault').optional().isBoolean(),
  ],
  validate,
  addAddress
);

router.put(
  '/addresses/:addressId',
  [
    body('label').optional().trim().notEmpty(),
    body('address').optional().trim().notEmpty(),
    body('isDefault').optional().isBoolean(),
  ],
  validate,
  updateAddress
);

router.delete('/addresses/:addressId', deleteAddress);

module.exports = router;
