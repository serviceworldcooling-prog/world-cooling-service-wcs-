const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => `BKG-${Date.now().toString().slice(-6)}`,
  },

  // Customer who made the booking
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Service info (matches frontend SERVICE_TYPES)
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'AC Service / Cleaning',
      'AC Repair',
      'Gas Charging',
      'AC Installation',
      'Water Leakage Fix',
      'Compressor Repair',
      'PCB / Electrical Fault',
      'Emergency Breakdown',
    ],
  },
  problemDescription: { type: String, default: '' },

  // Scheduling
  preferredDate: { type: String, required: true },   // "2026-07-21"
  preferredTime: { type: String, required: true },   // "10:00 AM"

  // Location
  address: { type: String, required: true },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  isLiveLocation: { type: Boolean, default: false },

  // Technician assigned by admin
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  technicianName: { type: String, default: 'Assigning...' },
  techAvatar: { type: String, default: '' },

  // Status flow: Pending → Confirmed → Upcoming → In Progress → Completed / Cancelled
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  },

  // Payment
  price: { type: Number, default: 0 },
  finalPrice: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'wallet', 'cash', 'Pending', null],
    default: null,
  },
  paymentStatus: { type: String, default: '' },

  // OTP for job start/completion verification
  startOtp: { type: String, default: null },
  isOtpVerified: { type: Boolean, default: false },
  startOtpVerified: { type: Boolean, default: false },
  otpStatus: { type: String, default: '' },

  // Emergency flag
  isEmergency: { type: Boolean, default: false },

  // Rescheduling
  rescheduledDate: { type: String, default: null },
  rescheduledTime: { type: String, default: null },

  // Cancellation
  cancelledAt: { type: Date, default: null },
  cancelledBy: { type: String, default: null },
  cancellationReason: { type: String, default: '' },

  // Completion
  completedAt: { type: Date, default: null },

  // Admin notes
  adminNote: { type: String, default: '' },

  // Review (linked)
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },

}, { timestamps: true });

// Indexes for quick queries
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ technicianId: 1, status: 1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
