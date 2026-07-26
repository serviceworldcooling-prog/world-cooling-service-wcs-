const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  service:      { type: String, required: true },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Claimed'],
    default: 'Active',
  },
  notes:        { type: String, default: '' },
  claimDate:    { type: Date, default: null },
  claimReason:  { type: String, default: '' },
}, {
  timestamps: true,
});

// Auto-expire based on endDate
warrantySchema.pre('save', function (next) {
  if (this.status === 'Active' && this.endDate && new Date() > this.endDate) {
    this.status = 'Expired';
  }
  next();
});

warrantySchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Warranty', warrantySchema);
