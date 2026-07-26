const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/rewardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/my',       restrictTo('customer'), ctrl.getMyRewards);
router.post('/redeem',  restrictTo('customer'), ctrl.redeemPoints);
router.get('/',         restrictTo('admin'),    ctrl.getAllRewards);

module.exports = router;
