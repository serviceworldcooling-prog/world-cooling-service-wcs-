const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/workReportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

// Technician: submit report + get own reports
router.post('/',                               restrictTo('technician'), ctrl.submitWorkReport);
router.get('/my',                              restrictTo('technician'), ctrl.getMyReports);
router.get('/booking/:bookingId',              ctrl.getReportByBooking);          // tech + admin

// Admin: view all + approve
router.get('/',        restrictTo('admin'), ctrl.getAllReports);
router.put('/:id/approve', restrictTo('admin'), ctrl.approveReport);

module.exports = router;
