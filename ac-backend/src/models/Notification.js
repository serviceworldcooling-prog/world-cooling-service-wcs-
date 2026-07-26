const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  title: { type: String, required: true },
  message: { type: String, required: true },

  // Matches frontend icon logic: booking | offer | payment | general
  type: {
    type: String,
    enum: ['booking', 'offer', 'payment', 'general'],
    default: 'general',
  },

  // Optional deep-link reference
  refId: { type: String, default: null },    // booking ID, coupon ID, etc.

  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// Index for fast user-based queries
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
