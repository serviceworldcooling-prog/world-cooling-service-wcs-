const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/technician/:technicianId', ctrl.getTechnicianReviews);              // public

router.use(protect);
router.post('/',         restrictTo('customer'), ctrl.createReview);
router.get('/my',        restrictTo('customer'), ctrl.getMyReviews);

router.get('/',          restrictTo('admin'), ctrl.getAllReviews);
router.put('/:id/reply', restrictTo('admin'), ctrl.replyToReview);
router.put('/:id/toggle-publish', restrictTo('admin'), ctrl.togglePublish);

module.exports = router;
