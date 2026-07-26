const mongoose = require('mongoose');

/**
 * ServiceOTP — in-app OTP system (NO external SMS/email service)
 *
 * Flow:
 * 1. When booking goes "In Progress":
 *    - startOtp is generated (customer shows it to technician)
 *    - Technician calls POST /service-otp/verify-start  → booking status: "In Progress" + startOtpVerified: true
 *
 * 2. When technician finishes work:
 *    - endOtp is generated (technician shows it to customer)
 *    - Customer calls POST /service-otp/verify-end  → booking status: "Completed" + endOtpVerified: true
 *    - OTP record is DELETED immediately after successful verify
 *
 * 3. Both OTPs auto-expire after OTP_EXPIRES_MINUTES (default: 2 minutes)
 *    - CRON in server.js runs every minute and cleans up expired OTPs
 *
 * 4. Admin panel shows booking.otpStatus:
 *    - "Pending"
 *    - "Start OTP Verified"
 *    - "End OTP Verified - Work Completed"
 */
const serviceOtpSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,   // One active OTP record per booking at a time
  },

  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 4-digit numeric OTPs
  startOtp: { type: String, default: null },   // Customer → Technician (start job)
  endOtp:   { type: String, default: null },   // Technician → Customer (complete job)

  startOtpVerified: { type: Boolean, default: false },
  endOtpVerified:   { type: Boolean, default: false },

  // TTL: record expires and is removed from DB after expiresAt
  expiresAt: {
    type: Date,
    required: true,
    // MongoDB TTL index (backup cleanup — CRON is primary)
    index: { expireAfterSeconds: 0 },
  },
}, {
  timestamps: true,
});

// Helper to generate a random 4-digit OTP
serviceOtpSchema.statics.generateCode = function () {
  return String(Math.floor(1000 + Math.random() * 9000));
};

module.exports = mongoose.model('ServiceOTP', serviceOtpSchema);
