const User        = require('../models/User');
const Booking     = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Review      = require('../models/Review');
const Complaint   = require('../models/Complaint');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/dashboard — aggregated stats
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = asyncWrapper(async (req, res) => {
  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalBookings,
    pendingBookings,
    completedToday,
    totalCustomers,
    activeTechnicians,
    totalRevenueCur,
    totalRevenueLast,
    bookingsCur,
    bookingsLast,
    customersCur,
    customersLast,
    avgRatingResult,
    openComplaints,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'Pending' }),
    Booking.countDocuments({ status: 'Completed', completedAt: { $gte: today } }),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'technician', technicianStatus: { $ne: 'Off Duty' } }),
    Transaction.aggregate([{ $match: { status: 'success', createdAt: { $gte: thisMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: { status: 'success', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Booking.countDocuments({ createdAt: { $gte: thisMonth } }),
    Booking.countDocuments({ createdAt: { $gte: lastMonth, $lte: lastMonthEnd } }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: thisMonth } }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    Complaint.countDocuments({ status: 'Open' }),
  ]);

  const curRevenue  = totalRevenueCur[0]?.total  || 0;
  const lastRevenue = totalRevenueLast[0]?.total  || 1;
  const avgRating   = avgRatingResult[0]?.avg     || 0;

  const growth = (cur, prev) => prev === 0 ? 100 : Math.round(((cur - prev) / prev) * 100 * 10) / 10;

  // Monthly revenue chart (last 6 months)
  const revenueChart = await Transaction.aggregate([
    { $match: { status: 'success', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
    { $group: {
      _id:      { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      revenue:  { $sum: '$amount' },
      count:    { $sum: 1 },
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Cancelled bookings rate
  const cancelled = await Booking.countDocuments({ status: 'Cancelled' });
  const cancelRate = totalBookings > 0 ? Math.round((cancelled / totalBookings) * 100 * 10) / 10 : 0;

  return sendSuccess(res, 200, 'Dashboard stats', {
    totalBookings,
    pendingBookings,
    completedToday,
    totalCustomers,
    activeTechnicians,
    totalRevenue:       curRevenue,
    revenueGrowth:      growth(curRevenue, lastRevenue),
    bookingsGrowth:     growth(bookingsCur, bookingsLast || 1),
    customersGrowth:    growth(customersCur, customersLast || 1),
    avgRating:          Math.round(avgRating * 10) / 10,
    cancelRate,
    openComplaints,
    revenueChart,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/customers — list all customers
// ─────────────────────────────────────────────────────────────────────────────
const getCustomers = asyncWrapper(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = { role: 'customer' };
  if (status) filter.status = status;
  if (search) filter.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } },
  ];

  const total     = await User.countDocuments(filter);
  const customers = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, customers, total, page, limit);
});

// GET /api/v1/admin/customers/:id
const getCustomerById = asyncWrapper(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' }).select('-password').populate('activePlanId', 'name price duration');
  if (!customer) return sendError(res, 404, 'Customer not found');

  const recentBookings = await Booking.find({ customerId: customer._id })
    .sort({ createdAt: -1 }).limit(5)
    .populate('technicianId', 'name');

  return sendSuccess(res, 200, 'Customer fetched', { customer, recentBookings });
});

// PUT /api/v1/admin/customers/:id/status
const updateCustomerStatus = asyncWrapper(async (req, res) => {
  const { status } = req.body;
  if (!['Active', 'Inactive', 'Banned'].includes(status)) return sendError(res, 400, 'Invalid status');
  const customer = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
  if (!customer) return sendError(res, 404, 'Customer not found');
  return sendSuccess(res, 200, 'Customer status updated', { customer });
});

// ─────────────────────────────────────────────────────────────────────────────
// Technician management (admin)
// ─────────────────────────────────────────────────────────────────────────────
const getTechnicians = asyncWrapper(async (req, res) => {
  const { technicianStatus, search, page = 1, limit = 20 } = req.query;
  const filter = { role: 'technician' };
  if (technicianStatus) filter.technicianStatus = technicianStatus;
  if (search) filter.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } },
  ];

  const total      = await User.countDocuments(filter);
  const technicians = await User.find(filter).select('-password').sort({ rating: -1 }).skip((page - 1) * limit).limit(Number(limit));
  return sendPaginated(res, technicians, total, page, limit);
});

const getTechnicianById = asyncWrapper(async (req, res) => {
  const tech = await User.findOne({ _id: req.params.id, role: 'technician' }).select('-password');
  if (!tech) return sendError(res, 404, 'Technician not found');

  const recentJobs = await Booking.find({ technicianId: tech._id })
    .sort({ createdAt: -1 }).limit(5)
    .populate('customerId', 'name phone');

  return sendSuccess(res, 200, 'Technician fetched', { technician: tech, recentJobs });
});

const createTechnician = asyncWrapper(async (req, res) => {
  const { name, email, phone, password, specialty, city, certifications } = req.body;

  console.log('\n👨‍🔧 ════════════════════════════════════════════════');
  console.log('👨‍🔧  ADMIN → CREATE TECHNICIAN');
  console.log('👨‍🔧 ════════════════════════════════════════════════');
  console.log(`   📋 Name       : ${name}`);
  console.log(`   📱 Phone      : ${phone}`);
  console.log(`   📧 Email      : ${email}`);
  console.log(`   🛠️  Specialty  : ${specialty || 'Not set'}`);
  console.log(`   🏙️  City       : ${city || 'Not set'}`);
  console.log(`   🕐 Time       : ${new Date().toISOString()}`);

  if (!name || !email || !phone || !password) {
    console.log('   ❌ Validation failed — missing required fields\n');
    return sendError(res, 400, 'name, email, phone, password required');
  }

  // Check duplicate phone
  const existingPhone = await User.findOne({ phone: phone.trim(), role: 'technician' });
  if (existingPhone) {
    console.log(`   ❌ Phone ${phone} already registered to technician: ${existingPhone.name}\n`);
    return sendError(res, 400, `Phone number ${phone} is already registered to another technician`);
  }

  // Check duplicate email
  const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingEmail) {
    console.log(`   ❌ Email ${email} already in use\n`);
    return sendError(res, 400, `Email ${email} is already registered`);
  }

  console.log('   🔐 Hashing password...');
  const tech = await User.create({
    name,
    email,
    phone,
    password,
    role: 'technician',
    specialty,
    city,
    certifications: certifications || [],
  });

  const out = tech.toObject(); delete out.password;

  console.log(`   ✅ Technician created successfully!`);
  console.log(`   🆔 DB ID  : ${tech._id}`);
  console.log(`   📱 Phone  : ${tech.phone}  (use this to login in AC-REPAIRING)`);
  console.log(`   🔑 Password stored as bcrypt hash in DB`);
  console.log('👨‍🔧 ════════════════════════════════════════════════\n');

  return sendSuccess(res, 201, 'Technician created', { technician: out });
});

const updateTechnician = asyncWrapper(async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'specialty', 'city', 'certifications', 'technicianStatus', 'status'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const tech = await User.findOneAndUpdate({ _id: req.params.id, role: 'technician' }, updates, { new: true }).select('-password');
  if (!tech) return sendError(res, 404, 'Technician not found');
  return sendSuccess(res, 200, 'Technician updated', { technician: tech });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/admin/technicians/:id/avatar
// Admin uploads / replaces a technician's profile photo
// Body: { avatar: "data:image/jpeg;base64,..." }  (base64 data URL from browser)
// ─────────────────────────────────────────────────────────────────────────────
const uploadTechnicianAvatar = asyncWrapper(async (req, res) => {
  const { avatar } = req.body;

  if (!avatar || typeof avatar !== 'string') {
    return sendError(res, 400, 'avatar field is required (base64 data URL or https URL)');
  }

  // Basic size guard — base64 images shouldn't exceed ~5MB (5*1024*1024 * 4/3 chars)
  if (avatar.startsWith('data:image') && avatar.length > 7_000_000) {
    return sendError(res, 400, 'Image too large. Please use an image under 5 MB.');
  }

  const tech = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'technician' },
    { avatar },
    { new: true }
  ).select('-password');

  if (!tech) return sendError(res, 404, 'Technician not found');
  return sendSuccess(res, 200, 'Avatar updated', { technician: tech });
});

const deleteTechnician = asyncWrapper(async (req, res) => {
  await User.findOneAndDelete({ _id: req.params.id, role: 'technician' });
  return sendSuccess(res, 200, 'Technician deleted');
});

module.exports = {
  getDashboardStats,
  getCustomers, getCustomerById, updateCustomerStatus,
  getTechnicians, getTechnicianById, createTechnician, updateTechnician, uploadTechnicianAvatar, deleteTechnician,
};
