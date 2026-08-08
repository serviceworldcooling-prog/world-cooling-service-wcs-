const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');

const {
  createBooking,
  createEmergencyBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
} = require('../controllers/bookingController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All booking routes require auth
router.use(protect);

// ── POST /api/bookings ───────────────────────────────
router.post(
  '/',
  [
    body('serviceType')
      .notEmpty().withMessage('Service type is required')
      .isIn([
        'AC Service / Cleaning', 'AC Service & Cleaning', 'AC Service', 'AC Repair',
        'Gas Charging', 'AC Installation', 'AC Uninstallation', 'Jet Cleaning',
        'PCB Repair', 'Water Leakage', 'Water Leakage Fix', 'Compressor Repair',
        'PCB / Electrical Fault', 'Emergency Breakdown',
      ])
      .withMessage('Invalid service type'),
    body('preferredDate').notEmpty().withMessage('Preferred date is required'),
    body('preferredTime').notEmpty().withMessage('Preferred time is required'),
    body('address').notEmpty().withMessage('Service address is required'),
    body('lat').optional({ nullable: true }).isFloat(),
    body('lng').optional({ nullable: true }).isFloat(),
    body('isLiveLocation').optional({ nullable: true }).isBoolean(),
    body('problemDescription').optional().isString(),
  ],
  validate,
  createBooking
);

// ── POST /api/bookings/emergency ─────────────────────
router.post(
  '/emergency',
  [
    body('address').optional({ nullable: true }).isString(),
    body('lat').optional({ nullable: true }).isFloat(),
    body('lng').optional({ nullable: true }).isFloat(),
    body('description').optional({ nullable: true }).isString(),
  ],
  validate,
  createEmergencyBooking
);

// ── GET /api/bookings ────────────────────────────────
// ?status=Pending|Confirmed|Upcoming|Completed|Cancelled
router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['Pending', 'Confirmed', 'Upcoming', 'Completed', 'Cancelled'])
      .withMessage('Invalid status filter'),
  ],
  validate,
  getMyBookings
);

// ── GET /api/bookings/:id ────────────────────────────
router.get('/:id', getBookingById);

// ── PUT /api/bookings/:id/cancel ─────────────────────
router.put(
  '/:id/cancel',
  [body('reason').optional().isString()],
  validate,
  cancelBooking
);

// ── PUT /api/bookings/:id/reschedule ─────────────────
router.put(
  '/:id/reschedule',
  [
    body('newDate').notEmpty().withMessage('New date is required'),
    body('newTime').notEmpty().withMessage('New time is required'),
  ],
  validate,
  rescheduleBooking
);

module.exports = router;
