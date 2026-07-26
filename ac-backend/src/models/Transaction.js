const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['credit', 'debit', 'refund', 'wallet_topup', 'reward_redeem'],
    required: true,
  },
  amount:      { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  method: {
    type: String,
    enum: ['Card', 'UPI', 'Wallet', 'Cash', 'Reward', 'Refund', 'System'],
    default: 'System',
  },
  status: {
    type: String,
    enum: ['success', 'pending', 'failed'],
    default: 'success',
  },
  referenceId: { type: String, default: '' },  // External payment gateway ref
}, {
  timestamps: true,
});

transactionSchema.index({ customerId: 1, createdAt: -1 });
transactionSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
