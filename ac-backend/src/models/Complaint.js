const mongoose = require('mongoose');

const timelineStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completedAt: { type: Date, default: null },
  done: { type: Boolean, default: false },
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  // Auto-generated ticket number e.g. TKT-9321
  ticketNumber: {
    type: String,
    unique: true,
    default: () => `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Optional booking link
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },

  subject: { type: String, required: [true, 'Complaint subject is required'] },
  description: { type: String, required: [true, 'Complaint details are required'] },

  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },

  // Resolution timeline shown on frontend complaint-status screen
  timeline: {
    type: [timelineStepSchema],
    default: [
      { title: 'Complaint Filed',          description: 'Ticket registered successfully',        done: true },
      { title: 'Assigned to Manager',      description: 'Support manager assigned',               done: false },
      { title: 'Resolution in Progress',   description: 'Technician visit scheduled',             done: false },
      { title: 'Closed & Resolved',        description: 'Feedback received from customer',        done: false },
    ],
  },

  adminNote: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

complaintSchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
