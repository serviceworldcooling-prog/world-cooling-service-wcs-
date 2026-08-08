const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// Helper to query by either Mongoose _id or human-readable bookingId
const getQuery = (id, userId) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  return isObjectId
    ? { _id: id, customerId: userId }
    : { bookingId: id, customerId: userId };
};

// ─────────────────────────────────────────
// GET /api/tracking/:bookingId
// Returns booking tracking info + technician details
// Matches live-tracking.tsx screen data
// ─────────────────────────────────────────



exports.getTrackingInfo = async (req, res, next) => {
  try {
    const booking = await Booking.findOne(getQuery(req.params.bookingId, req.user._id))
      .populate('technicianId', 'phone')
      .select('-startOtp');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const technicianPhone = booking.technicianId?.phone || booking.technicianPhone || '';

    const customerLat = booking.lat || 28.6139;
    const customerLng = booking.lng || 77.2090;

    let techLat;
    let techLng;
    let estimatedArrivalMinutes;

    if (booking.techLat !== null && booking.techLng !== null) {
      techLat = booking.techLat;
      techLng = booking.techLng;

      // Real distance calculation (Haversine formula)
      const degToRad = Math.PI / 180;
      const R = 6371; // Earth radius in km
      const dLat = (customerLat - techLat) * degToRad;
      const dLon = (customerLng - techLng) * degToRad;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(techLat*degToRad) * Math.cos(customerLat*degToRad) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = R * c;

      // Estimate arrival minutes based on distance (approx 3 min per km + 2 min buffer)
      estimatedArrivalMinutes = booking.status === 'Upcoming' ? Math.max(1, Math.round(distanceKm * 3 + 2)) : 0;
    } else {
      // Simulate technician moving closer to customer over 3 minutes from start of location sharing
      const startOffsetLat = 0.012;
      const startOffsetLng = 0.012;
      const journeyDurationMs = 3 * 60 * 1000; // 3 minutes for simulation
      const elapsedMs = Date.now() - new Date(booking.updatedAt).getTime();
      const progress = Math.min(Math.max(elapsedMs / journeyDurationMs, 0), 1);

      techLat = customerLat + startOffsetLat * (1 - progress);
      techLng = customerLng + startOffsetLng * (1 - progress);

      const maxEta = 15; // 15 mins starting
      estimatedArrivalMinutes = booking.status === 'Upcoming' ? Math.max(1, Math.round(maxEta * (1 - progress))) : 0;
    }

    res.status(200).json({
      success: true,
      tracking: {
        bookingId: booking.bookingId,
        status: booking.status,
        serviceType: booking.serviceType,
        address: booking.address,
        technicianName: booking.technicianName,
        techAvatar: booking.techAvatar,
        technicianPhone: technicianPhone || '',
        isOtpVerified: booking.isOtpVerified,
        isLiveLocation: Boolean(booking.isLiveLocation && booking.techLat && booking.techLng),
        estimatedArrivalMinutes,
        technicianLocation: { lat: techLat, lng: techLng },
        customerLocation: { lat: customerLat, lng: customerLng },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/tracking/:bookingId/verify-otp
// Customer shares OTP with technician to start the job
// Matches "Enter OTP from Technician" button in booking-details.tsx
// and the otpRow in live-tracking.tsx
// ─────────────────────────────────────────
exports.verifyStartOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const booking = await Booking.findOne(getQuery(req.params.bookingId, req.user._id)).select('+startOtp');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.isOtpVerified) {
      return res.status(400).json({ success: false, message: 'OTP already verified for this booking' });
    }

    if (booking.startOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    booking.isOtpVerified = true;
    booking.status = 'Upcoming';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified. Service has started.',
      bookingId: booking.bookingId,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/tracking/:bookingId/complete
// Customer confirms service completion
// Matches handleConfirmServiceComplete in live-tracking.tsx
// ─────────────────────────────────────────
exports.confirmComplete = async (req, res, next) => {
  try {
    const booking = await Booking.findOne(getQuery(req.params.bookingId, req.user._id));

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Booking already completed' });
    }

    booking.status = 'Completed';
    await booking.save();

    await Notification.create({
      user: req.user._id,
      title: 'Service Completed',
      message: `Your ${booking.serviceType} service has been completed. Please rate your technician.`,
      type: 'booking',
      refId: booking.bookingId,
    });

    res.status(200).json({
      success: true,
      message: 'Service marked as completed. Thank you!',
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
      },
    });
  } catch (err) {
    next(err);
  }
};
