const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getCoupons, applyCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public — browse coupons
router.get('/', getCoupons);

// Auth required to apply
router.post(
  '/apply',
  protect,
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('orderAmount').isFloat({ min: 0 }).withMessage('Order amount must be a positive number'),
  ],
  validate,
  applyCoupon
);

module.exports = router;
