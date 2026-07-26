const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Wrench' },        // lucide icon name
  image: { type: String, default: '' },
  basePrice: { type: Number, default: 0 },

  // Category (matches CATEGORIES in frontend mocks)
  category: {
    type: String,
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
    required: true,
  },

  // What's included bullet points
  inclusions: [{ type: String }],

  // Estimated time to complete
  estimatedTime: { type: String, default: '1-2 hours' },

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
