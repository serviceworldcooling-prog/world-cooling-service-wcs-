const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/serviceOtpController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

// Customer: get their startOTP to show to technician
router.get('/start/:bookingId',       restrictTo('customer'),   ctrl.getStartOtp);

// Technician: verify startOTP (customer showed it)
router.post('/verify-start',          restrictTo('technician'), ctrl.verifyStartOtp);

// Technician: generate endOTP after finishing work
router.post('/generate-end/:bookingId', restrictTo('technician'), ctrl.generateEndOtp);

// Customer: verify endOTP (technician told them)
router.post('/verify-end',            restrictTo('customer'),   ctrl.verifyEndOtp);

// Admin: view OTP status for any booking
router.get('/status/:bookingId',      restrictTo('admin'),      ctrl.getOtpStatus);

module.exports = router;
