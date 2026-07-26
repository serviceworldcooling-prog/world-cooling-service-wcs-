const mongoose = require('mongoose');

/**
 * WorkReport — submitted by technician after completing a job
 * Admin reviews it, then marks booking Completed
 */
const workReportSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Work performed — selected from checklist + free text
  workDone: { type: String, required: true },
  selectedWorks: [{ type: String }],  // e.g. ['Filter Cleaning', 'Gas Charging']
  techNote: { type: String, default: '' },

  // Photo URLs (uploaded separately or as base64 in dev)
  photos: [{ type: String }],

  // Admin review
  adminReviewed: { type: Boolean, default: false },
  adminApprovedAt: { type: Date, default: null },

  submittedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

workReportSchema.index({ bookingId: 1 });
workReportSchema.index({ technicianId: 1 });

module.exports = mongoose.model('WorkReport', workReportSchema);
