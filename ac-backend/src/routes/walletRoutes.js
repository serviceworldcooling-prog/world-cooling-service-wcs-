const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/walletController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',              restrictTo('customer'), ctrl.getWallet);
router.post('/topup',        restrictTo('customer'), ctrl.topUpWallet);
router.get('/transactions',  restrictTo('customer'), ctrl.getTransactions);
router.get('/all',           restrictTo('admin'),    ctrl.getAllTransactions);

module.exports = router;
