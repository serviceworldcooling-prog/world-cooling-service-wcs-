const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/referralController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my',                      restrictTo('customer'), ctrl.getMyReferrals);
router.post('/apply-code',              restrictTo('customer'), ctrl.applyReferralCode);
router.post('/claim-free-service',      restrictTo('customer'), ctrl.claimFreeServiceVoucher);
router.get('/',                        restrictTo('admin'),    ctrl.getAllReferrals);

module.exports = router;
