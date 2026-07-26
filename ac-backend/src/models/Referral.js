const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredName:  { type: String, required: true },
  referredEmail: { type: String, required: true },
  referredUserId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referralCode:  { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Expired'],
    default: 'Pending',
  },
  rewardAmount:  { type: Number, default: 50 },
  rewardPaid:    { type: Boolean, default: false },
  bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  completedAt:   { type: Date, default: null },
}, {
  timestamps: true,
});

referralSchema.index({ referrerId: 1 });
referralSchema.index({ referralCode: 1 });

module.exports = mongoose.model('Referral', referralSchema);
