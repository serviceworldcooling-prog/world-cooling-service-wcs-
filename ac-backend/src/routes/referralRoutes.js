const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/referralController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/my',           restrictTo('customer'), ctrl.getMyReferrals);
router.post('/complete',    restrictTo('admin'),    ctrl.completeReferral);
router.get('/',             restrictTo('admin'),    ctrl.getAllReferrals);

module.exports = router;
