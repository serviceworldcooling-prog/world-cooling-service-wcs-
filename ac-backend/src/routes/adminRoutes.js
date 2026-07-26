const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');

const adminCtrl        = require('../controllers/adminController');
const bookingCtrl      = require('../controllers/adminBookingController');
const complaintCtrl    = require('../controllers/adminComplaintController');
const notifCtrl        = require('../controllers/adminNotificationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// All admin routes require auth + admin role
router.use(protect, restrictTo('admin'));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', adminCtrl.getDashboardStats);

// ── Customers ────────────────────────────────────────────────────────────────
router.get('/customers',            adminCtrl.getCustomers);
router.get('/customers/:id',        adminCtrl.getCustomerById);
router.put('/customers/:id/status', adminCtrl.updateCustomerStatus);

// ── Technician management ─────────────────────────────────────────────────────
router.get('/technicians',                 adminCtrl.getTechnicians);
router.get('/technicians/:id',             adminCtrl.getTechnicianById);
router.post('/technicians',                adminCtrl.createTechnician);
router.put('/technicians/:id',             adminCtrl.updateTechnician);
router.put('/technicians/:id/avatar',      adminCtrl.uploadTechnicianAvatar);
router.delete('/technicians/:id',          adminCtrl.deleteTechnician);

// ── Booking management ────────────────────────────────────────────────────────
router.get('/bookings',                               bookingCtrl.getAllBookings);
router.get('/bookings/pending-assignment',            bookingCtrl.getPendingAssignment);
router.get('/bookings/:id',                           bookingCtrl.getBookingById);
router.post('/bookings',                              bookingCtrl.createBooking);
router.put('/bookings/:id',                           bookingCtrl.updateBooking);
router.put('/bookings/:id/assign',                    bookingCtrl.assignTechnician);
router.put('/bookings/:id/status',                    bookingCtrl.updateBookingStatus);
router.delete('/bookings/:id',                        bookingCtrl.deleteBooking);

// ── Complaint management ──────────────────────────────────────────────────────
router.get('/complaints',           complaintCtrl.getAllComplaints);
router.get('/complaints/:id',       complaintCtrl.getComplaintById);
router.put('/complaints/:id/status', [
  body('status').isIn(['Open', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status'),
], validate, complaintCtrl.updateStatus);
router.put('/complaints/:id/note',  complaintCtrl.saveAdminNote);
router.delete('/complaints/:id',    complaintCtrl.deleteComplaint);

// ── Notification broadcast ────────────────────────────────────────────────────
router.get('/notifications',       notifCtrl.getAll);
router.post('/notifications/broadcast', [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
  body('type').isIn(['booking', 'offer', 'payment', 'general']).withMessage('Invalid type'),
  body('targetAudience').isIn(['all', 'customers', 'technicians', 'single']).withMessage('Invalid targetAudience'),
], validate, notifCtrl.broadcast);

module.exports = router;
