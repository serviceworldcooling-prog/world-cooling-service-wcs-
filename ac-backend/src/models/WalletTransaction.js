const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },

  amount: { type: Number, required: true, min: 0 },

  // Running balance after this transaction
  balanceAfter: { type: Number, required: true },

  description: { type: String, required: true },

  // Source of this transaction
  source: {
    type: String,
    enum: ['booking_payment', 'add_money', 'refund', 'admin_credit', 'coupon_cashback'],
    required: true,
  },

  // Optional reference (booking ID, etc.)
  refId: { type: String, default: null },

}, { timestamps: true });

walletTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
