const mongoose = require('mongoose');

const workChecklistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Work title is required'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      default: 'Servicing',
      enum: ['Servicing', 'Repair', 'Installation', 'Replacement', 'Electrical', 'General'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkChecklist', workChecklistSchema);
