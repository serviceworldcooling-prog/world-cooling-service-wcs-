const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    default: '',
  },
  acType: {
    type: String,
    default: '',
  },
  capacity: {
    type: String,
    default: '',
  },
  starRating: {
    type: String,
    default: '',
  },
  usageDuration: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
    required: true,
  }],
  video: {
    type: String,
  },
  sellerPhone: {
    type: String,
    required: true,
  },
  sellerEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
