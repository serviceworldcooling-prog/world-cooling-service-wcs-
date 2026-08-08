const WorkReport = require('../models/WorkReport');
const Booking    = require('../models/Booking');
const User       = require('../models/User');
const ServiceOTP = require('../models/ServiceOTP');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseUtils');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/work-reports
// Technician submits work report after completing the job
// After submission: auto-generates endOtp (customer verifies it)
// ─────────────────────────────────────────────────────────────────────────────
const submitWorkReport = asyncWrapper(async (req, res) => {
  const { 
    bookingId, 
    workDone, 
    selectedWorks, 
    techNote, 
    photos, 
    video,
    warrantyActive,
    warrantyPeriod,
    warrantyDetails,
    extraMaterialCharges = 0,
    extraAmountTaken = 0
  } = req.body;

  if (!bookingId || !workDone) {
    return sendError(res, 400, 'bookingId and workDone are required');
  }

  // Verify booking belongs to this technician
  const booking = await Booking.findOne({
    _id: bookingId,
    technicianId: req.user._id,
  });
  if (!booking) {
    return sendError(res, 404, 'Booking not found or not assigned to you');
  }
  if (booking.status !== 'In Progress') {
    return sendError(res, 400, 'Booking must be In Progress to submit a work report');
  }

  // Prevent duplicate submission
  const existing = await WorkReport.findOne({ bookingId });
  if (existing) {
    return sendError(res, 409, 'Work report already submitted for this booking');
  }

  // Calculate new total price
  const basePrice = (booking.finalPrice && booking.finalPrice > 0) ? booking.finalPrice : (booking.price || 0);
  const extraCharges = Number(extraMaterialCharges) || 0;
  const extraTaken = Number(extraAmountTaken) || 0;
  const finalUpdatedPrice = basePrice + extraCharges + extraTaken;

  // Save changes to booking
  booking.extraMaterialCharges = extraCharges;
  booking.extraAmountTaken = extraTaken;
  booking.finalPrice = finalUpdatedPrice;

  if (warrantyActive) {
    booking.warrantyStatus = 'Active';
    booking.warrantyPeriod = warrantyPeriod || '3 Months';
    booking.warrantyDetails = warrantyDetails || 'Warranty on replaced parts / cooling service.';
  } else {
    booking.warrantyStatus = 'None';
  }
  await booking.save();

  // Create report (not yet OTP verified)
  const { acNo, modelNo, warrantyReason } = req.body;
  const report = await WorkReport.create({
    bookingId,
    technicianId: req.user._id,
    customerId: booking.customerId,
    workDone,
    selectedWorks: selectedWorks || [],
    techNote: techNote || '',
    photos: photos || [],
    video: video || '',
    warrantyActive: !!warrantyActive,
    warrantyPeriod: warrantyPeriod || '',
    warrantyDetails: warrantyDetails || '',
    acNo: acNo || '',
    modelNo: modelNo || '',
    warrantyReason: warrantyReason || '',
    extraMaterialCharges: extraCharges,
    extraAmountTaken: extraTaken,
    otpVerified: false,
  });

  // Auto-generate end OTP for customer verification
  const expiresAt = new Date(
    Date.now() + (Number(process.env.OTP_EXPIRES_MINUTES) || 2) * 60 * 1000
  );
  const endOtp = ServiceOTP.generateCode
    ? ServiceOTP.generateCode()
    : String(Math.floor(1000 + Math.random() * 9000));

  let otpRecord = await ServiceOTP.findOne({ bookingId });
  if (!otpRecord) {
    otpRecord = await ServiceOTP.create({
      bookingId,
      customerId: booking.customerId,
      technicianId: req.user._id,
      startOtpVerified: true,
      endOtp,
      expiresAt,
    });
  } else {
    otpRecord.endOtp    = endOtp;
    otpRecord.expiresAt = expiresAt;
    await otpRecord.save();
  }

  // Create in-app notifications
  const Notification = require('../models/Notification');
  
  // 1. Notify Customer
  let customerMsg = `Your service is complete. Total Amount: ₹${finalUpdatedPrice} (Base: ₹${basePrice}`;
  if (extraCharges > 0) customerMsg += `, Extra Material: ₹${extraCharges}`;
  if (extraTaken > 0) customerMsg += `, Extra Labor/Other: ₹${extraTaken}`;
  customerMsg += `).`;
  if (warrantyActive) {
    customerMsg += ` Warranty Card of ${warrantyPeriod} issued!`;
  }
  customerMsg += ` Share OTP: ${endOtp} with technician to confirm.`;

  await Notification.create({
    user: booking.customerId,
    title: 'Service Completed & Invoice Updated',
    message: customerMsg,
    type: 'booking',
    refId: bookingId.toString(),
  });

  // 2. Notify Admin
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await Notification.create({
      user: admin._id,
      title: `Job Completed - Invoice Updated (BKG #${booking.bookingId})`,
      message: `Technician ${req.user.name} completed service. Updated Total: ₹${finalUpdatedPrice} (Base: ₹${basePrice}, Extra Material: ₹${extraCharges}, Extra Amount: ₹${extraTaken}).`,
      type: 'booking',
      refId: bookingId.toString(),
    });
  }

  return sendSuccess(res, 201, 'Work report initiated. Ask customer for completion OTP.', {
    report,
    expiresAt,
    message: `An OTP has been sent to customer. Ask them for the OTP to complete submission.`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/work-reports/booking/:bookingId
// Get report for a specific booking — technician, admin
// ─────────────────────────────────────────────────────────────────────────────
const getReportByBooking = asyncWrapper(async (req, res) => {
  const report = await WorkReport.findOne({ bookingId: req.params.bookingId })
    .populate('technicianId', 'name avatar phone specialty')
    .populate('customerId', 'name phone avatar')
    .populate('bookingId', 'serviceType preferredDate preferredTime address invoiceId bookingId');

  if (!report) {
    return sendError(res, 404, 'Work report not found for this booking');
  }

  // Technicians can only see their own reports
  if (
    req.user.role === 'technician' &&
    report.technicianId._id.toString() !== req.user._id.toString()
  ) {
    return sendError(res, 403, 'Access denied');
  }

  return sendSuccess(res, 200, 'Work report fetched', { report });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/work-reports/my — Technician gets their own submitted reports
// ─────────────────────────────────────────────────────────────────────────────
const getMyReports = asyncWrapper(async (req, res) => {
  const reports = await WorkReport.find({ technicianId: req.user._id })
    .populate('bookingId', 'serviceType preferredDate preferredTime address status bookingId')
    .populate('customerId', 'name phone avatar')
    .sort({ submittedAt: -1 });

  return sendSuccess(res, 200, 'Reports fetched', { count: reports.length, reports });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/work-reports — Admin gets all reports
// ─────────────────────────────────────────────────────────────────────────────
const getAllReports = asyncWrapper(async (req, res) => {
  const { adminReviewed, page = 1, limit = 20 } = req.query;
  const filter = { otpVerified: true };
  if (adminReviewed !== undefined) filter.adminReviewed = adminReviewed === 'true';

  const total   = await WorkReport.countDocuments(filter);
  const reports = await WorkReport.find(filter)
    .populate('technicianId', 'name avatar phone specialty')
    .populate('customerId',   'name phone avatar')
    .populate({
      path: 'bookingId',
      select: 'bookingId serviceType preferredDate preferredTime address status invoiceId price finalPrice customerId technicianId',
      populate: [
        { path: 'customerId', select: 'name phone avatar' },
        { path: 'technicianId', select: 'name phone avatar specialty' }
      ]
    })
    .sort({ submittedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return sendSuccess(res, 200, 'All reports fetched', { total, reports });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/work-reports/:id/approve — Admin approves work report
// Marks booking as Completed after review
// ─────────────────────────────────────────────────────────────────────────────
const approveReport = asyncWrapper(async (req, res) => {
  const report = await WorkReport.findById(req.params.id);
  if (!report) return sendError(res, 404, 'Report not found');

  report.adminReviewed  = true;
  report.adminApprovedAt = new Date();
  await report.save();

  // Mark booking completed
  await Booking.findByIdAndUpdate(report.bookingId, {
    status: 'Completed',
    completedAt: new Date(),
    otpStatus: 'End OTP Verified - Work Completed',
    paymentStatus: 'Paid',
  });

  // Update technician stats
  const booking = await Booking.findById(report.bookingId);
  if (booking) {
    await User.findByIdAndUpdate(report.technicianId, {
      technicianStatus: 'Available',
      activeBookingId: null,
      $inc: { completedJobs: 1, earnings: (booking.finalPrice || booking.price || 0) * 0.7 },
    });
  }

  return sendSuccess(res, 200, 'Work report approved. Booking marked Completed.', { report });
});

module.exports = {
  submitWorkReport,
  getReportByBooking,
  getMyReports,
  getAllReports,
  approveReport,
};
