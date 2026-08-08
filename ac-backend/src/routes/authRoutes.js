const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword,
  getMe,
  technicianLogin,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Too many attempts. Please wait 15 minutes.' },
});

// OTP endpoints get tighter limiting
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Wait 10 minutes.' },
});

// ── POST /api/auth/register ──────────────────────────
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

// ── POST /api/auth/login ─────────────────────────────
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// ── POST /api/auth/forgot-password ──────────────────
router.post(
  '/forgot-password',
  otpLimiter,
  [body('email').isEmail().withMessage('Valid email required').normalizeEmail()],
  validate,
  forgotPassword
);

// ── POST /api/auth/verify-otp ────────────────────────
router.post(
  '/verify-otp',
  otpLimiter,
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('otp').isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits').isNumeric(),
  ],
  validate,
  verifyOtp
);

// ── POST /api/auth/resend-otp ────────────────────────
router.post(
  '/resend-otp',
  otpLimiter,
  [body('email').isEmail().withMessage('Valid email required').normalizeEmail()],
  validate,
  resendOtp
);

// ── POST /api/auth/reset-password ───────────────────
// Requires the resetToken returned by verify-otp
router.post(
  '/reset-password',
  protect,
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  resetPassword
);

// ── GET /api/auth/me ───────────────────────────────────────
router.get('/me', protect, getMe);

// ── POST /api/auth/technician/login ────────────────────────────
// Dedicated login endpoint for the AC-REPAIRING technician mobile app.
// Accepts phone number OR email as 'identifier' field + password.
// Only allows users with role === 'technician'.
router.post(
  '/technician/login',
  authLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Phone number or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  technicianLogin
);

// ── GET /api/auth/cloudinary-signature ───────────────────
router.get('/cloudinary-signature', protect, (req, res) => {
  try {
    const crypto = require('crypto');
    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    if (!apiSecret) {
      return res.status(500).json({ success: false, message: 'Cloudinary API secret is not configured' });
    }

    // Create signature string
    const signatureStr = `timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    res.status(200).json({
      success: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
