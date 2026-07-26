const User       = require('../models/User');
const Booking    = require('../models/Booking');
const Notification = require('../models/Notification');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// GET /api/v1/technicians/my-jobs — technician sees assigned bookings
const getMyJobs = asyncWrapper(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { technicianId: req.user._id };
  if (status) filter.status = status;

  const total    = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('customerId', 'name phone avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, bookings, total, page, limit);
});

// PUT /api/v1/technicians/status — technician updates own status
const updateMyStatus = asyncWrapper(async (req, res) => {
  const { technicianStatus } = req.body;
  if (!['Available', 'On Job', 'Off Duty'].includes(technicianStatus)) {
    return sendError(res, 400, 'Invalid status');
  }
  const tech = await User.findByIdAndUpdate(req.user._id, { technicianStatus }, { new: true }).select('-password');
  return sendSuccess(res, 200, 'Status updated', { technicianStatus: tech.technicianStatus });
});

// GET /api/v1/technicians/earnings — technician's own earnings summary
const getMyEarnings = asyncWrapper(async (req, res) => {
  const tech = await User.findById(req.user._id).select('earnings completedJobs name');
  const recentJobs = await Booking.find({ technicianId: req.user._id, status: 'Completed' })
    .sort({ completedAt: -1 }).limit(10)
    .populate('customerId', 'name');
  return sendSuccess(res, 200, 'Earnings fetched', {
    totalEarnings: tech.earnings,
    completedJobs: tech.completedJobs,
    recentJobs,
  });
});

// GET /api/v1/technicians/profile — technician sees own profile
const getMyProfile = asyncWrapper(async (req, res) => {
  const tech = await User.findById(req.user._id).select('-password');
  return sendSuccess(res, 200, 'Profile fetched', { technician: tech });
});

// PUT /api/v1/technicians/profile — technician updates own profile
const updateMyProfile = asyncWrapper(async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'city', 'fcmToken'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const tech = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  return sendSuccess(res, 200, 'Profile updated', { technician: tech });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/technicians/jobs/:bookingId/accept
// Technician accepts an Assigned job → status becomes Accepted
// ─────────────────────────────────────────────────────────────────────────────
const acceptJob = asyncWrapper(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    technicianId: req.user._id,
  });
  if (!booking) return sendError(res, 404, 'Booking not found or not assigned to you');
  if (booking.status !== 'Upcoming' && booking.status !== 'Pending') {
    return sendError(res, 400, `Cannot accept a booking with status "${booking.status}"`);
  }

  booking.status = 'Upcoming'; // Upcoming = accepted by tech in this system
  await booking.save();

  // Notify customer
  await Notification.create({
    user: booking.customerId,
    title: 'Technician Accepted Your Booking',
    message: `A technician has accepted your ${booking.serviceType} booking and is on the way.`,
    type: 'booking',
    refId: booking.bookingId,
  }).catch(() => {});

  return sendSuccess(res, 200, 'Job accepted', { booking });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/technicians/jobs/:bookingId/start
// Technician starts the job → status becomes In Progress
// (happens after start OTP is verified OR manually)
// ─────────────────────────────────────────────────────────────────────────────
const startJob = asyncWrapper(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    technicianId: req.user._id,
  });
  if (!booking) return sendError(res, 404, 'Booking not found or not assigned to you');
  if (booking.status !== 'Upcoming') {
    return sendError(res, 400, `Booking must be Upcoming to start (current: ${booking.status})`);
  }

  booking.status           = 'In Progress';
  booking.startOtpVerified = true;
  booking.otpStatus        = 'Start OTP Verified';
  await booking.save();

  // Mark technician as On Job
  await User.findByIdAndUpdate(req.user._id, { technicianStatus: 'On Job', activeBookingId: booking._id });

  await Notification.create({
    user: booking.customerId,
    title: 'Service Started',
    message: `Your ${booking.serviceType} service has started. The technician is now working.`,
    type: 'booking',
    refId: booking.bookingId,
  }).catch(() => {});

  return sendSuccess(res, 200, 'Job started. Status is now In Progress.', { booking });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/technicians/jobs/:bookingId — get single job detail
// ─────────────────────────────────────────────────────────────────────────────
const getJobById = asyncWrapper(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    technicianId: req.user._id,
  }).populate('customerId', 'name phone avatar addresses');

  if (!booking) return sendError(res, 404, 'Booking not found');
  return sendSuccess(res, 200, 'Booking fetched', { booking });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/technicians/change-password
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = asyncWrapper(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'currentPassword and newPassword are required');
  }

  const tech = await User.findById(req.user._id).select('+password');
  const bcrypt = require('bcryptjs');
  const isMatch = await bcrypt.compare(currentPassword, tech.password);
  if (!isMatch) return sendError(res, 401, 'Current password is incorrect');

  tech.password = newPassword;
  await tech.save();
  return sendSuccess(res, 200, 'Password changed successfully');
});

module.exports = {
  getMyJobs, updateMyStatus, getMyEarnings, getMyProfile, updateMyProfile,
  acceptJob, startJob, getJobById, changePassword,
};
