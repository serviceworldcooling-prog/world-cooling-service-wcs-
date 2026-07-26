const mongoose = require('mongoose');

const amcPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },           // "Gold AMC Care Plan"
  duration: { type: String, required: true },       // "12 Months", "6 Months"
  durationMonths: { type: Number, required: true }, // 12, 6, etc.
  price: { type: Number, required: true },
  description: { type: String, default: '' },

  // Feature inclusions shown on membership-plans & amc-details screen
  inclusions: [{ type: String }],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('AMCPlan', amcPlanSchema);
