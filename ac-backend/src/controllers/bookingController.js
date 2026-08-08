const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateOTP = require('../utils/generateOTP');

// ─────────────────────────────────────────
// Helper: push a notification for the user
// ─────────────────────────────────────────
const pushNotification = async (userId, title, message, type = 'booking', refId = null) => {
  try {
    await Notification.create({ user: userId, title, message, type, refId });
  } catch (_) {
    // Non-fatal — don't break the main request
  }
};

// ─────────────────────────────────────────
// POST /api/bookings
// Create a new regular service booking
// Matches request-service.tsx submit flow
// ─────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  try {
    console.log('\n📝 ════════════════════════════════════════════════');
    console.log('📝  CREATE BOOKING REQUEST RECEIVED');
    console.log('   Payload:', JSON.stringify(req.body, null, 2));
    console.log('📝 ════════════════════════════════════════════════\n');

    const {
      serviceType,
      problemDescription,
      preferredDate,
      preferredTime,
      address,
      lat,
      lng,
      isLiveLocation,
      price,
    } = req.body;

    // Generate a 4-digit OTP for job start verification (shown on live-tracking screen)
    const startOtp = generateOTP();

    const booking = await Booking.create({
      customerId: req.user._id,
      serviceType,
      problemDescription,
      preferredDate,
      preferredTime,
      address,
      lat: lat || null,
      lng: lng || null,
      isLiveLocation: false, // Must be explicitly enabled by serviceman via Share Location button
      startOtp,
      price: price || 0,
      finalPrice: price || 0,
      status: 'Pending',
    });

    await pushNotification(
      req.user._id,
      'Booking Received',
      `Your ${serviceType} request has been submitted. Admin will assign a technician shortly.`,
      'booking',
      booking.bookingId
    );

    res.status(201).json({
      success: true,
      message: 'Service request submitted. Admin will assign a technician shortly.',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/bookings/emergency
// Emergency booking — bypasses normal queue
// Matches emergency.tsx triggerEmergencyBooking
// ─────────────────────────────────────────
exports.createEmergencyBooking = async (req, res, next) => {
  try {
    const { address, lat, lng, description } = req.body;

    const startOtp = generateOTP();

    const booking = await Booking.create({
      customerId: req.user._id,
      serviceType: 'Emergency Breakdown',
      problemDescription: description || 'EMERGENCY: Total AC breakdown.',
      preferredDate: new Date().toISOString().split('T')[0],
      preferredTime: 'Immediate',
      address: address || 'Live Location',
      lat: lat || null,
      lng: lng || null,
      isLiveLocation: true,
      isEmergency: true,
      startOtp,
      status: 'Confirmed',   // Emergency bookings auto-confirm
      price: 149.00,
    });

    await pushNotification(
      req.user._id,
      '🚨 Emergency Technician Dispatched',
      'Your emergency booking is confirmed. A master technician is being dispatched. ETA: 25 minutes.',
      'booking',
      booking.bookingId
    );

    res.status(201).json({
      success: true,
      message: 'Emergency technician dispatched. ETA 25 minutes.',
      booking,
      eta: 25,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/bookings
// List bookings for the logged-in customer
// Supports ?status=Upcoming|Completed|Cancelled|Pending
// Matches bookings.tsx tab filter
// ─────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { customerId: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('technicianId', 'name avatar phone')
      .sort({ createdAt: -1 })
      .select('-startOtp');  // Never send OTP in list view

    const mappedBookings = bookings.map(b => {
      const bObj = b.toObject();
      if (bObj.technicianId && typeof bObj.technicianId === 'object') {
        bObj.technicianName = bObj.technicianId.name || bObj.technicianName;
        bObj.techAvatar = bObj.technicianId.avatar || bObj.techAvatar;
        bObj.technicianPhone = bObj.technicianId.phone || bObj.technicianPhone;
      }
      return bObj;
    });

    res.status(200).json({ success: true, count: mappedBookings.length, bookings: mappedBookings });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/bookings/:id
// Single booking detail — maps to booking-details.tsx
// ─────────────────────────────────────────
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user._id,
    })
      .populate('technicianId', 'name avatar phone')
      .populate('review', 'rating comment createdAt');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const bObj = booking.toObject();
    if (bObj.technicianId && typeof bObj.technicianId === 'object') {
      bObj.technicianName = bObj.technicianId.name || bObj.technicianName;
      bObj.techAvatar = bObj.technicianId.avatar || bObj.techAvatar;
      bObj.technicianPhone = bObj.technicianId.phone || bObj.technicianPhone;
    }

    res.status(200).json({ success: true, booking: bObj });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/bookings/:id/cancel
// Matches handleCancel in booking-details.tsx
// ─────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!['Pending', 'Confirmed', 'Upcoming'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is ${booking.status}`,
      });
    }

    // Free up technician if assigned
    if (booking.technicianId) {
      await User.findByIdAndUpdate(booking.technicianId, {
        technicianStatus: 'Available',
        activeBookingId: null,
      });
    }

    // Delete the booking from the database
    await Booking.findByIdAndDelete(booking._id);

    await pushNotification(
      req.user._id,
      'Booking Cancelled',
      `Booking ${booking.bookingId} has been cancelled and removed.`,
      'booking',
      booking.bookingId
    );

    res.status(200).json({ success: true, message: 'Booking cancelled and deleted', booking });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/bookings/:id/reschedule
// Matches handleReschedule in booking-details.tsx
// ─────────────────────────────────────────
exports.rescheduleBooking = async (req, res, next) => {
  try {
    const { newDate, newTime } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!['Pending', 'Confirmed', 'Upcoming'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a booking that is ${booking.status}`,
      });
    }

    booking.rescheduledDate = newDate;
    booking.rescheduledTime = newTime;
    booking.preferredDate = newDate;
    booking.preferredTime = newTime;
    await booking.save();

    await pushNotification(
      req.user._id,
      'Booking Rescheduled',
      `Your booking ${booking.bookingId} has been rescheduled to ${newDate} at ${newTime}.`,
      'booking',
      booking.bookingId
    );

    res.status(200).json({ success: true, message: 'Booking rescheduled', booking });
  } catch (err) {
    next(err);
  }
};
