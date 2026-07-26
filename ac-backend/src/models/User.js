const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true },       // Home, Office, etc.
  address: { type: String, required: true },
  city: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  isDefault: { type: Boolean, default: false },
}, { _id: true, timestamps: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },

  // OTP fields (for forgot password flow)
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  isEmailVerified: { type: Boolean, default: false },

  // Wallet
  walletBalance: { type: Number, default: 0, min: 0 },

  // AMC Membership
  hasMembership: { type: Boolean, default: false },
  activePlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'AMCPlan', default: null },
  membershipExpiresAt: { type: Date, default: null },

  // Saved addresses (embedded)
  addresses: [addressSchema],

  role: {
    type: String,
    enum: ['customer', 'technician', 'admin'],
    default: 'customer',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Banned'],
    default: 'Active',
  },
  technicianStatus: {
    type: String,
    enum: ['Available', 'On Job', 'Off Duty'],
    default: 'Available',
  },
  specialty: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  certifications: [{
    type: String,
  }],
  rating: {
    type: Number,
    default: 5,
  },
  activeBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
