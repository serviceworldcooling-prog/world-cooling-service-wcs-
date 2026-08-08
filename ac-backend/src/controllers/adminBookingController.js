const Booking = require('../models/Booking');
const User = require('../models/User');
const WorkReport = require('../models/WorkReport');
const Notification = require('../models/Notification');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');
const { triggerFirstBookingReferralReward } = require('./referralController');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/bookings
// All bookings with search, status filter, pagination
// ─────────────────────────────────────────────────────────────────────────────
const getAllBookings = asyncWrapper(async (req, res) => {
  const { status, search, technicianId, customerId, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (technicianId) filter.technicianId = technicianId;
  if (customerId) filter.customerId = customerId;

  if (search) {
    // We'll do a two-step: find matching user IDs first, then filter bookings
    const userIds = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    const ids = userIds.map(u => u._id);
    filter.$or = [
      { customerId: { $in: ids } },
      { technicianId: { $in: ids } },
      { serviceType: { $regex: search, $options: 'i' } },
      { bookingId: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('customerId', 'name phone avatar email walletBalance')
    .populate('technicianId', 'name phone avatar specialty rating technicianStatus')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  // Normalize bookings: ensure `customer` is a plain object with name/phone/avatar
  const plainBookings = bookings.map(b => (b && typeof b.toObject === 'function') ? b.toObject() : { ...b });

  // Collect customer ids that are not populated objects
  const customerIds = [...new Set(plainBookings.map(b => {
    if (b.customerId && typeof b.customerId === 'object') return null; // already populated
    if (b.customerId) return String(b.customerId);
    if (b.customer) return String(b.customer);
    return null;
  }).filter(id => id))];

  let customersMap = {};
  if (customerIds.length > 0) {
    const users = await User.find({ _id: { $in: customerIds } }).select('name phone avatar email');
    customersMap = users.reduce((acc, u) => { acc[String(u._id)] = u; return acc; }, {});
  }

  const bookingsWithAlias = plainBookings.map(b => {
    // Prefer populated `customerId` object, fall back to lookup by id
    if (b.customerId && typeof b.customerId === 'object') {
      b.customer = b.customerId;
    } else {
      const custId = b.customerId ? String(b.customerId) : (b.customer ? String(b.customer) : null);
      b.customer = custId && customersMap[custId] ? customersMap[custId] : (b.customer || null);
    }
    return b;
  });

  return sendPaginated(res, bookingsWithAlias, total, page, limit);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/bookings/:id
// ─────────────────────────────────────────────────────────────────────────────
const getBookingById = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'name phone avatar email addresses')
    .populate('technicianId', 'name phone avatar specialty rating completedJobs city certifications');

  if (!booking) return sendError(res, 404, 'Booking not found');

  // Convert to plain object so we can safely mutate
  const bookingObj = booking.toObject();

  // ── Resolve customer — handles TWO legacy shapes: ─────────────────────────
  //   Shape A (new): customerId = populated object  { _id, name, phone, ... }
  //   Shape B (old): customer   = raw ObjectId string, customerId missing/null
  //
  // We always normalise to bookingObj.customerId = { _id, name, phone, email }
  // so the frontend has one consistent field to read.

  const isPopulatedObj = (v) =>
    v && typeof v === 'object' && !Array.isArray(v) && (v.name || v.phone);

  if (!isPopulatedObj(bookingObj.customerId)) {
    // Resolve the raw ID from whichever field holds it
    const rawId =
      (bookingObj.customerId && typeof bookingObj.customerId !== 'object'
        ? bookingObj.customerId                      // ObjectId on customerId
        : null) ??
      (bookingObj.customer && typeof bookingObj.customer !== 'object'
        ? bookingObj.customer                        // ObjectId on legacy `customer`
        : null) ??
      bookingObj.customerId?._id ??                  // partial populate
      bookingObj.customer?._id ??
      null;

    if (rawId) {
      const user = await User.findById(rawId).select('name phone avatar email').lean();
      bookingObj.customerId = user || {
        _id: rawId,
        name: 'Deleted User',
        phone: '—',
        email: '—',
        avatar: '',
      };
    }
  }

  // Attach work report if exists
  const workReport = await WorkReport.findOne({ bookingId: booking._id }).lean();

  return sendSuccess(res, 200, 'Booking fetched', { booking: bookingObj, workReport });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/admin/bookings — Admin creates a booking manually
// ─────────────────────────────────────────────────────────────────────────────
const createBooking = asyncWrapper(async (req, res) => {
  const {
    customerId: bodyCustomerId,
    customer,
    technicianId, serviceType, problemDescription,
    preferredDate, preferredTime, address, price, paymentMethod,
  } = req.body;
  const customerId = bodyCustomerId || customer; // fallback for legacy 'customer' field

  if (!customerId || !serviceType || !preferredDate || !preferredTime || !address) {
    return sendError(res, 400, 'customerId, serviceType, preferredDate, preferredTime, address are required');
  }

  let technicianName = 'Assigning...';
  let techAvatar = '';
  let technicianPhone = '';
  if (technicianId) {
    const technician = await User.findById(technicianId);
    if (technician) {
      technicianName = technician.name;
      techAvatar = technician.avatar || '';
      technicianPhone = technician.phone || '';
    }
  }

  const booking = await Booking.create({
    customerId,
    technicianId: technicianId || null,
    technicianName,
    techAvatar,
    technicianPhone,
    serviceType,
    problemDescription: problemDescription || '',
    preferredDate,
    preferredTime,
    address,
    price: price || 0,
    finalPrice: price || 0,
    paymentMethod: paymentMethod || 'Pending',
    status: technicianId ? 'Upcoming' : 'Pending',
  });

  if (technicianId) {
    await User.findByIdAndUpdate(technicianId, {
      technicianStatus: 'On Job',
      activeBookingId: booking._id,
    });
    await Notification.create({
      user: technicianId,
      title: 'New Job Assigned',
      message: `Admin assigned you a ${serviceType} job at ${address}`,
      type: 'booking',
      refId: booking.bookingId,
    }).catch(() => { });
  }

  return sendSuccess(res, 201, 'Booking created', { booking });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/admin/bookings/:id — Admin edits booking (price, time, etc.)
// ─────────────────────────────────────────────────────────────────────────────
const updateBooking = asyncWrapper(async (req, res) => {
  const allowed = [
    'serviceType', 'problemDescription', 'preferredDate', 'preferredTime',
    'address', 'price', 'finalPrice', 'paymentMethod', 'adminNote', 'workReport',
  ];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate('customerId', 'name phone avatar')
    .populate('technicianId', 'name phone avatar specialty');

  if (!booking) return sendError(res, 404, 'Booking not found');
  return sendSuccess(res, 200, 'Booking updated', { booking });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/admin/bookings/:id/assign — Assign / reassign technician
// ─────────────────────────────────────────────────────────────────────────────
const assignTechnician = asyncWrapper(async (req, res) => {
  const { technicianId, price } = req.body;
  if (!technicianId) return sendError(res, 400, 'technicianId is required');

  const [booking, technician] = await Promise.all([
    Booking.findById(req.params.id),
    User.findOne({ _id: technicianId, role: 'technician' }),
  ]);

  if (!booking) return sendError(res, 404, 'Booking not found');
  if (!technician) return sendError(res, 404, 'Technician not found');
  if (['Completed', 'Cancelled'].includes(booking.status)) {
    return sendError(res, 400, `Cannot assign technician to a ${booking.status} booking`);
  }

  // Free up previous technician if reassigning
  if (booking.technicianId && booking.technicianId.toString() !== technicianId) {
    await User.findByIdAndUpdate(booking.technicianId, {
      technicianStatus: 'Available',
      activeBookingId: null,
    });
  }

  // Update booking atomically to avoid save-time validation errors if customerId missing
  const updates = {
    technicianId,
    technicianName: technician.name,
    techAvatar: technician.avatar || '',
    technicianPhone: technician.phone || '',
    status: 'Upcoming'
  };
  if (price !== undefined) {
    updates.finalPrice = Number(price);
    if (!booking.price || booking.price === 0) {
      updates.price = Number(price);
    }
  }
  const updatedBooking = await Booking.findByIdAndUpdate(booking._id, updates, { new: true });

  // Mark technician as On Job
  await User.findByIdAndUpdate(technicianId, {
    technicianStatus: 'On Job',
    activeBookingId: updatedBooking._id,
  });

  // Notify technician
  await Notification.create({
    user: technicianId,
    title: 'New Job Assigned',
    message: `You have been assigned a ${updatedBooking.serviceType} job for ${updatedBooking.preferredDate} at ${updatedBooking.address}`,
    type: 'booking',
    refId: updatedBooking.bookingId,
  }).catch(() => { });

  // Notify customer only if customerId exists
  try {
    const customerUserId = updatedBooking.customerId || booking.customer || null;
    if (customerUserId) {
      await Notification.create({
        user: customerUserId,
        title: 'Technician Assigned',
        message: `${technician.name} has been assigned to your ${updatedBooking.serviceType} booking.`,
        type: 'booking',
        refId: updatedBooking.bookingId,
      }).catch(() => { });
    }
  } catch (e) {
    console.warn('assignTechnician: failed to notify customer', e.message || e);
  }

  const updated = await Booking.findById(updatedBooking._id)
    .populate('customerId', 'name phone avatar')
    .populate('technicianId', 'name phone avatar specialty rating');

  return sendSuccess(res, 200, 'Technician assigned successfully', { booking: updated });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/admin/bookings/:id/status — Admin updates booking status
// ─────────────────────────────────────────────────────────────────────────────
const updateBookingStatus = asyncWrapper(async (req, res) => {
  const { status, cancellationReason } = req.body;
  const validStatuses = ['Pending', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return sendError(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return sendError(res, 404, 'Booking not found');

  const prevStatus = booking.status;

  // Build update object — use findByIdAndUpdate to bypass required-field validation
  // (customerId is required in the schema but may be missing on legacy bookings)
  const statusUpdate = { status };

  if (status === 'Completed' && prevStatus !== 'Completed') {
    statusUpdate.completedAt = new Date();
    statusUpdate.paymentStatus = 'Paid';
    statusUpdate.otpStatus = 'End OTP Verified - Work Completed';

    // Free technician
    if (booking.technicianId) {
      await User.findByIdAndUpdate(booking.technicianId, {
        technicianStatus: 'Available',
        activeBookingId: null,
        $inc: { completedJobs: 1, earnings: (booking.finalPrice || 0) * 0.7 },
      });
    }

    // Notify customer (safe — skip if customerId missing)
    if (booking.customerId) {
      await Notification.create({
        user: booking.customerId,
        title: 'Service Completed',
        message: `Your ${booking.serviceType} service has been completed successfully.`,
        type: 'booking',
        refId: booking.bookingId,
      }).catch(() => { });
    }
  }

  if (status === 'Cancelled') {
    statusUpdate.cancelledBy = 'admin';
    statusUpdate.cancellationReason = cancellationReason || 'Cancelled by admin';
    statusUpdate.cancelledAt = new Date();
    if (booking.technicianId) {
      await User.findByIdAndUpdate(booking.technicianId, {
        technicianStatus: 'Available',
        activeBookingId: null,
      });
    }
  }

  // Use findByIdAndUpdate with { runValidators: false } to skip required-field checks
  await Booking.findByIdAndUpdate(booking._id, statusUpdate, { runValidators: false });

  const updated = await Booking.findById(booking._id)
    .populate('customerId', 'name phone avatar')
    .populate('technicianId', 'name phone avatar specialty');

  if (status === 'Completed' && prevStatus !== 'Completed') {
    triggerFirstBookingReferralReward(updated).catch(() => {});
  }

  return sendSuccess(res, 200, `Booking status updated to ${status}`, { booking: updated });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/admin/bookings/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteBooking = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return sendError(res, 404, 'Booking not found');

  if (booking.technicianId) {
    await User.findByIdAndUpdate(booking.technicianId, {
      technicianStatus: 'Available',
      activeBookingId: null,
    });
  }

  await Booking.findByIdAndDelete(req.params.id);
  return sendSuccess(res, 200, 'Booking deleted');
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/bookings/pending-assignment
// Bookings that have no technician assigned yet
// ─────────────────────────────────────────────────────────────────────────────
const getPendingAssignment = asyncWrapper(async (req, res) => {
  const bookings = await Booking.find({
    status: { $in: ['Pending', 'Upcoming'] },
    technicianId: null,
  })
    .populate('customerId', 'name phone avatar')
    .sort({ createdAt: 1 }); // oldest first

  // Normalize pending assignment bookings so `customer` is object
  const plain = bookings.map(b => (b && typeof b.toObject === 'function') ? b.toObject() : { ...b });
  const pending = plain.map(b => {
    if (b.customerId && typeof b.customerId === 'object') b.customer = b.customerId;
    else b.customer = b.customer || null;
    return b;
  });

  return sendSuccess(res, 200, 'Pending assignment bookings', {
    count: pending.length,
    bookings: pending,
  });
});

module.exports = {
  getAllBookings, getBookingById, createBooking, updateBooking,
  assignTechnician, updateBookingStatus, deleteBooking, getPendingAssignment,
};
