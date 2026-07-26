const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  code:           { type: String, required: true, unique: true, uppercase: true, trim: true },
  discount:       { type: Number, required: true, min: 0 },
  discountType:   { type: String, enum: ['percent', 'flat'], required: true },
  description:    { type: String, default: '' },
  expiry:         { type: Date, required: true },
  usageCount:     { type: Number, default: 0 },
  maxUsage:       { type: Number, default: 1000 },
  isActive:       { type: Boolean, default: true },
  minOrderValue:  { type: Number, default: 0 },
  imageUrl:       { type: String, default: '' },
}, {
  timestamps: true,
});

offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1, expiry: 1 });

module.exports = mongoose.model('Offer', offerSchema);
