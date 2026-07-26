const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getPaymentPreview,
  processPayment,
  getWallet,
  getWalletTransactions,
  addMoneyToWallet,
  getInvoice,
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// ── GET  /api/payments/wallet ────────────────────────
router.get('/wallet', getWallet);

// ── GET  /api/payments/wallet/transactions ───────────
router.get('/wallet/transactions', getWalletTransactions);

// ── POST /api/payments/wallet/add ────────────────────
router.post(
  '/wallet/add',
  [body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0')],
  validate,
  addMoneyToWallet
);

// ── GET  /api/payments/preview/:bookingId ────────────
router.get('/preview/:bookingId', getPaymentPreview);

// ── POST /api/payments/pay/:bookingId ────────────────
router.post(
  '/pay/:bookingId',
  [
    body('paymentMethod')
      .isIn(['upi', 'card', 'wallet', 'cash'])
      .withMessage('Invalid payment method'),
    body('couponCode').optional().isString(),
  ],
  validate,
  processPayment
);

// ── GET  /api/payments/invoice/:bookingId ────────────
router.get('/invoice/:bookingId', getInvoice);

module.exports = router;
