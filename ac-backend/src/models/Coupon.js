const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  discount: { type: Number, required: true },          // flat amount off e.g. 15
  discountType: {
    type: String,
    enum: ['flat', 'percent'],
    default: 'flat',
  },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null },        // cap for percent type

  // Validity
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },

  // Usage limits
  usageLimit: { type: Number, default: null },         // null = unlimited
  usedCount: { type: Number, default: 0 },

  // Which users have already used this coupon
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isActive: { type: Boolean, default: true },

  // Optional image for banner display
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
