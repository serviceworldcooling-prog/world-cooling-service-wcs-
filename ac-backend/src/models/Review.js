const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  service:      { type: String, required: true },
  rating:       { type: Number, required: true, min: 1, max: 5 },
  comment:      { type: String, default: '' },
  isPublished:  { type: Boolean, default: true },
  reply:        { type: String, default: '' },   // Admin/technician reply
  replyAt:      { type: Date, default: null },
}, {
  timestamps: true,
});

reviewSchema.index({ technicianId: 1 });
reviewSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
