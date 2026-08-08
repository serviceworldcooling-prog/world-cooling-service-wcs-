const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/technicianController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect, restrictTo('technician'));

// Profile & status
router.get('/profile',         ctrl.getMyProfile);
router.put('/profile',         ctrl.updateMyProfile);
router.put('/status',          ctrl.updateMyStatus);
router.put('/change-password', ctrl.changePassword);

// Jobs list & detail
router.get('/my-jobs',                    ctrl.getMyJobs);
router.get('/jobs/:bookingId',            ctrl.getJobById);

// Per-job actions
router.put('/jobs/:bookingId/accept',     ctrl.acceptJob);
router.put('/jobs/:bookingId/start',      ctrl.startJob);
router.put('/jobs/:bookingId/share-location', ctrl.shareLocation);

// Earnings
router.get('/earnings', ctrl.getMyEarnings);

module.exports = router;
