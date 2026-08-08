const ServiceOTP  = require('../models/ServiceOTP');
const Booking     = require('../models/Booking');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseUtils');

/**
 * OTP FLOW (all in-app, no SMS/email):
 *
 * STEP 1 — Technician assigned → booking goes "Upcoming"
 *   Customer opens live-tracking screen, sees startOTP
 *   → GET /api/v1/service-otp/start/:bookingId   (customer fetches their startOTP)
 *   Customer SHOWS this OTP to technician (verbally / shows screen)
 *
 * STEP 2 — Technician enters it on his app
 *   → POST /api/v1/service-otp/verify-start       (technician submits startOTP)
 *   Booking → "In Progress" | otpStatus → "Start OTP Verified"
 *
 * STEP 3 — Technician finishes work, generates endOTP on his app
 *   → POST /api/v1/service-otp/generate-end/:bookingId  (technician generates endOTP)
 *   Technician TELLS this OTP to customer
 *
 * STEP 4 — Customer enters it on verify-otp screen
 *   → POST /api/v1/service-otp/verify-end         (customer submits endOTP)
 *   Booking → "Completed" | otpStatus → "End OTP Verified - Work Completed"
 *   OTP record DELETED immediately
 *
 * ADMIN: can see booking.otpStatus at any time
 *   → GET /api/v1/service-otp/status/:bookingId   (admin views OTP status)
 *
 * OTPs auto-expire after OTP_EXPIRES_MINUTES (default 2 min)
 * CRON in server.js cleans up expired records every minute
 */

const OTP_EXPIRY_MS = () => (Number(process.env.OTP_EXPIRES_MINUTES) || 2) * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// @route  GET /api/v1/service-otp/start/:bookingId
// @access Private (customer)
// Returns existing startOTP or generates a fresh one
// ─────────────────────────────────────────────────────────────────────────────
const getStartOtp = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) return sendError(res, 404, 'Booking not found');
  if (booking.customerId.toString() !== req.user._id.toString()) return sendError(res, 403, 'Access denied');

  if (!['Upcoming', 'In Progress'].includes(booking.status)) {
    return sendError(res, 400, 'Start OTP is only available for Upcoming or In Progress bookings');
  }

  if (!booking.technicianId) {
    return sendError(res, 400, 'No technician assigned yet');
  }

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS());

  // Upsert — regenerate startOtp each time customer fetches (refresh after expiry)
  let record = await ServiceOTP.findOne({ bookingId: booking._id });

  if (!record) {
    record = await ServiceOTP.create({
      bookingId:    booking._id,
      customerId:   booking.customerId,
      technicianId: booking.technicianId,
      startOtp:     ServiceOTP.generateCode(),
      expiresAt,
    });
  } else if (!record.startOtpVerified) {
    // Refresh OTP and expiry
    record.startOtp   = ServiceOTP.generateCode();
    record.expiresAt  = expiresAt;
    await record.save();
  }

  return sendSuccess(res, 200, 'Start OTP fetched', {
    startOtp:         record.startOtp,
    startOtpVerified: record.startOtpVerified,
    expiresAt:        record.expiresAt,
    message: 'Show this OTP to the technician to begin the service',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/v1/service-otp/verify-start
// @access Private (technician)
// Body: { bookingId, otp }
// ─────────────────────────────────────────────────────────────────────────────
const verifyStartOtp = asyncWrapper(async (req, res) => {
  const { bookingId, otp } = req.body;
  if (!bookingId || !otp) return sendError(res, 400, 'bookingId and otp are required');

  const record = await ServiceOTP.findOne({ bookingId });
  if (!record) return sendError(res, 404, 'No active OTP found for this booking');

  // Verify technician owns this booking
  if (record.technicianId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'You are not assigned to this booking');
  }

  if (record.startOtpVerified) {
    return sendError(res, 400, 'Start OTP already verified');
  }

  // Check expiry
  if (new Date() > record.expiresAt) {
    await ServiceOTP.deleteOne({ _id: record._id });
    return sendError(res, 400, 'OTP has expired. Ask customer to refresh it.');
  }

  // Verify OTP value
  if (record.startOtp !== otp) {
    return sendError(res, 400, 'Invalid OTP. Please check and try again.');
  }

  // Mark verified
  record.startOtpVerified = true;
  record.expiresAt        = new Date(Date.now() + OTP_EXPIRY_MS()); // reset timer for end OTP
  await record.save();

  // Update booking
  await Booking.findByIdAndUpdate(bookingId, {
    status:           'In Progress',
    startOtpVerified: true,
    otpStatus:        'Start OTP Verified',
  });

  return sendSuccess(res, 200, 'Start OTP verified! Job has begun.', {
    startOtpVerified: true,
    otpStatus: 'Start OTP Verified',
    message: 'Booking is now In Progress',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/v1/service-otp/generate-end/:bookingId
// @access Private (technician)
// Technician generates endOTP after completing work
// ─────────────────────────────────────────────────────────────────────────────
const generateEndOtp = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) return sendError(res, 404, 'Booking not found');
  if (booking.technicianId?.toString() !== req.user._id.toString()) return sendError(res, 403, 'Access denied');
  if (booking.status !== 'In Progress') return sendError(res, 400, 'Booking must be In Progress');

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS());

  let record = await ServiceOTP.findOne({ bookingId: booking._id });
  if (!record) {
    record = await ServiceOTP.create({
      bookingId:        booking._id,
      customerId:       booking.customerId,
      technicianId:     booking.technicianId,
      startOtpVerified: true,
      endOtp:           ServiceOTP.generateCode(),
      expiresAt,
    });
  } else {
    record.endOtp    = ServiceOTP.generateCode();
    record.expiresAt = expiresAt;
    await record.save();
  }

  // Create in-app notification for the customer with the regenerated OTP
  const Notification = require('../models/Notification');
  await Notification.create({
    user: booking.customerId,
    title: 'Service Completion OTP',
    message: `Your service is complete. Please share this OTP: ${record.endOtp} with your technician to confirm completion.`,
    type: 'booking',
    refId: booking._id.toString(),
  });

  return sendSuccess(res, 200, 'End OTP generated', {
    endOtp:    record.endOtp,
    expiresAt: record.expiresAt,
    message:   'Tell this OTP to the customer to confirm service completion',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/v1/service-otp/verify-end
// @access Private (customer)
// Body: { bookingId, otp }
// ─────────────────────────────────────────────────────────────────────────────
const verifyEndOtp = asyncWrapper(async (req, res) => {
  const { bookingId, otp } = req.body;
  if (!bookingId || !otp) return sendError(res, 400, 'bookingId and otp are required');

  const record = await ServiceOTP.findOne({ bookingId });
  if (!record) return sendError(res, 404, 'No active OTP for this booking');

  if (record.customerId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Access denied');
  }

  if (!record.startOtpVerified) {
    return sendError(res, 400, 'Start OTP must be verified first');
  }

  if (record.endOtpVerified) {
    return sendError(res, 400, 'End OTP already verified');
  }

  if (!record.endOtp) {
    return sendError(res, 400, 'Technician has not generated the completion OTP yet');
  }

  if (new Date() > record.expiresAt) {
    await ServiceOTP.deleteOne({ _id: record._id });
    return sendError(res, 400, 'OTP has expired. Ask technician to generate a new one.');
  }

  if (record.endOtp !== otp) {
    return sendError(res, 400, 'Invalid OTP. Check with your technician.');
  }

  // ── SUCCESS — update booking and DELETE OTP record ─────────────────────────
  await Booking.findByIdAndUpdate(bookingId, {
    status:          'Completed',
    completedAt:     new Date(),
    endOtpVerified:  true,
    otpVerifiedAt:   new Date(),
    otpStatus:       'End OTP Verified - Work Completed',
    paymentStatus:   'Paid',
  });

  // Delete OTP record immediately after successful verification
  await ServiceOTP.deleteOne({ _id: record._id });

  // Free up technician
  const booking = await Booking.findById(bookingId);
  if (booking?.technicianId) {
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');
    const Reward      = require('../models/Reward');

    await User.findByIdAndUpdate(booking.technicianId, {
      technicianStatus: 'Available',
      activeBookingId:  null,
      $inc: { completedJobs: 1, earnings: booking.finalPrice * 0.7 },
    });

    await User.findByIdAndUpdate(booking.customerId, {
      $inc: { totalSpent: booking.finalPrice },
    });

    await Transaction.create({
      customerId:  booking.customerId,
      type:        'credit',
      amount:      booking.finalPrice,
      description: `Payment for ${booking.service} (${booking.invoiceId})`,
      bookingId:   booking._id,
      method:      booking.paymentMethod || 'Cash',
      status:      'success',
    });

    // Award reward points (10 pts per currency unit)
    const pts = Math.floor(booking.finalPrice * 10);
    if (pts > 0) {
      await Reward.findOneAndUpdate(
        { customerId: booking.customerId },
        { $inc: { totalPoints: pts }, lastActivity: new Date() },
        { upsert: true }
      );
    }
  }

  return sendSuccess(res, 200, 'OTP Verified Successfully! Service marked as completed.', {
    endOtpVerified: true,
    otpStatus: 'End OTP Verified - Work Completed',
    message: 'Thank you for using AC Service!',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @route  POST /api/v1/service-otp/verify-end-tech
// @access Private (technician)
// Body: { bookingId, otp }
// ─────────────────────────────────────────────────────────────────────────────
const verifyEndOtpTech = asyncWrapper(async (req, res) => {
  const { bookingId, otp } = req.body;
  if (!bookingId || !otp) return sendError(res, 400, 'bookingId and otp are required');

  const record = await ServiceOTP.findOne({ bookingId });
  if (!record) return sendError(res, 404, 'No active OTP for this booking');

  if (record.technicianId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Access denied');
  }

  if (!record.startOtpVerified) {
    return sendError(res, 400, 'Start OTP must be verified first');
  }

  if (record.endOtpVerified) {
    return sendError(res, 400, 'End OTP already verified');
  }

  if (!record.endOtp) {
    return sendError(res, 400, 'Completion OTP has not been generated yet');
  }

  if (new Date() > record.expiresAt) {
    await ServiceOTP.deleteOne({ _id: record._id });
    return sendError(res, 400, 'OTP has expired. Please submit the work report again to generate a new OTP.');
  }

  if (record.endOtp !== otp) {
    return sendError(res, 400, 'Invalid OTP. Please check with the customer.');
  }

  // Find the WorkReport for this booking
  const WorkReport = require('../models/WorkReport');
  const report = await WorkReport.findOne({ bookingId });
  if (!report) {
    return sendError(res, 404, 'Work report not found for this booking');
  }

  // Mark report as OTP verified
  report.otpVerified = true;
  await report.save();

  // Update booking and attach workReport data
  await Booking.findByIdAndUpdate(bookingId, {
    status:          'Completed',
    completedAt:     new Date(),
    endOtpVerified:  true,
    otpVerifiedAt:   new Date(),
    otpStatus:       'End OTP Verified - Work Completed',
    paymentStatus:   'Paid',
    workReport: {
      submittedAt: report.submittedAt.toLocaleString(),
      workDone: report.workDone,
      photos: report.photos || [],
      techNote: report.techNote || '',
      video: report.video || '',
    },
  });

  // Delete OTP record immediately after successful verification
  await ServiceOTP.deleteOne({ _id: record._id });

  // Free up technician and update earnings
  const booking = await Booking.findById(bookingId);
  if (booking?.technicianId) {
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');
    const Reward      = require('../models/Reward');

    await User.findByIdAndUpdate(booking.technicianId, {
      technicianStatus: 'Available',
      activeBookingId:  null,
      $inc: { completedJobs: 1, earnings: booking.finalPrice * 0.7 },
    });

    await User.findByIdAndUpdate(booking.customerId, {
      $inc: { totalSpent: booking.finalPrice },
    });

    await Transaction.create({
      customerId:  booking.customerId,
      type:        'credit',
      amount:      booking.finalPrice,
      description: `Payment for ${booking.service} (${booking.invoiceId})`,
      bookingId:   booking._id,
      method:      booking.paymentMethod || 'Cash',
      status:      'success',
    });

    // Award reward points
    const pts = Math.floor(booking.finalPrice * 10);
    if (pts > 0) {
      await Reward.findOneAndUpdate(
        { customerId: booking.customerId },
        { $inc: { totalPoints: pts }, lastActivity: new Date() },
        { upsert: true }
      );
    }
  }

  return sendSuccess(res, 200, 'OTP Verified Successfully! Work report submitted to admin.', {
    endOtpVerified: true,
    otpStatus: 'End OTP Verified - Work Completed',
    message: 'Work report successfully submitted to admin.',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @route  GET /api/v1/service-otp/status/:bookingId
// @access Private (admin)
// Admin panel sees OTP verification status text
// ─────────────────────────────────────────────────────────────────────────────
const getOtpStatus = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate('customerId',   'name phone')
    .populate('technicianId', 'name phone');

  if (!booking) return sendError(res, 404, 'Booking not found');

  const otpRecord = await ServiceOTP.findOne({ bookingId: booking._id });

  return sendSuccess(res, 200, 'OTP status fetched', {
    bookingId:        booking._id,
    invoiceId:        booking.invoiceId,
    service:          booking.service,
    bookingStatus:    booking.status,
    otpStatus:        booking.otpStatus,            // Text shown in admin panel
    startOtpVerified: booking.startOtpVerified,
    endOtpVerified:   booking.endOtpVerified,
    otpVerifiedAt:    booking.otpVerifiedAt,
    hasActiveOtp:     !!otpRecord,
    otpExpiresAt:     otpRecord?.expiresAt || null,
    customer:         booking.customerId,
    technician:       booking.technicianId,
  });
});

module.exports = {
  getStartOtp, verifyStartOtp,
  generateEndOtp, verifyEndOtp, verifyEndOtpTech,
  getOtpStatus,
};
