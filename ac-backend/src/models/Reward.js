const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalPoints:  { type: Number, default: 0 },
  usedPoints:   { type: Number, default: 0 },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze',
  },
  lastActivity:  { type: Date, default: Date.now },
  pointsExpiry:  { type: Date, default: null },
  redemptions:   { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Auto-calculate tier based on totalPoints
rewardSchema.pre('save', function (next) {
  const pts = this.totalPoints - this.usedPoints;
  if (pts >= 5000)      this.tier = 'Platinum';
  else if (pts >= 2500) this.tier = 'Gold';
  else if (pts >= 1000) this.tier = 'Silver';
  else                  this.tier = 'Bronze';
  next();
});

// Helper: available points
rewardSchema.virtual('availablePoints').get(function () {
  return Math.max(0, this.totalPoints - this.usedPoints);
});

module.exports = mongoose.model('Reward', rewardSchema);
