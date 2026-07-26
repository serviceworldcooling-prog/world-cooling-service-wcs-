const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getTrackingInfo, verifyStartOtp, confirmComplete } = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// ── GET  /api/tracking/:bookingId ────────────────────
router.get('/:bookingId', getTrackingInfo);

// ── POST /api/tracking/:bookingId/verify-otp ─────────
router.post(
  '/:bookingId/verify-otp',
  [
    body('otp')
      .isLength({ min: 4, max: 4 })
      .withMessage('OTP must be 4 digits')
      .isNumeric()
      .withMessage('OTP must be numeric'),
  ],
  validate,
  verifyStartOtp
);

// ── PUT  /api/tracking/:bookingId/complete ───────────
router.put('/:bookingId/complete', confirmComplete);

module.exports = router;
