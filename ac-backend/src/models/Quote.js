const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType:  { type: String, required: true },
  description:  { type: String, required: true },
  location:     { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Quoted', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  quotedAmount:       { type: Number, default: null },
  assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  notes:              { type: String, default: '' },
  isCommercial:       { type: Boolean, default: false },
  adminReply:         { type: String, default: '' },
  respondedAt:        { type: Date, default: null },
}, {
  timestamps: true,
});

quoteSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Quote', quoteSchema);
