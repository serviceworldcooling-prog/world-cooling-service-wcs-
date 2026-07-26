const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────
// GET /api/tracking/:bookingId
// Returns booking tracking info + technician details
// Matches live-tracking.tsx screen data
// ─────────────────────────────────────────
exports.getTrackingInfo = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user._id,
    }).select('-startOtp');  // OTP not returned here — only via verify endpoint

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Simulate technician live location (in production this comes from technician app via socket/DB)
    const mockTechLocation = {
      lat: (booking.lat || 24.8607) + 0.01,
      lng: (booking.lng || 67.0011) + 0.01,
    };

    res.status(200).json({
      success: true,
      tracking: {
        bookingId: booking.bookingId,
        status: booking.status,
        serviceType: booking.serviceType,
        address: booking.address,
        technicianName: booking.technicianName,
        techAvatar: booking.techAvatar,
        isOtpVerified: booking.isOtpVerified,
        estimatedArrivalMinutes: booking.status === 'Upcoming' ? 25 : 0,
        technicianLocation: mockTechLocation,
        customerLocation: { lat: booking.lat, lng: booking.lng },
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

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user._id,
    }).select('+startOtp');

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
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user._id,
    });

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
