require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Route imports ────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const serviceRoutes      = require('./routes/serviceRoutes');
const bookingRoutes      = require('./routes/bookingRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');
const amcRoutes          = require('./routes/amcRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const complaintRoutes    = require('./routes/complaintRoutes');
const couponRoutes       = require('./routes/couponRoutes');
const trackingRoutes     = require('./routes/trackingRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const adminRoutes      = require('./routes/adminRoutes');
const serviceOtpRoutes   = require('./routes/serviceOtpRoutes');
const offerRoutes        = require('./routes/offerRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const walletRoutes       = require('./routes/walletRoutes');
const referralRoutes     = require('./routes/referralRoutes');
const rewardRoutes       = require('./routes/rewardRoutes');
const warrantyRoutes     = require('./routes/warrantyRoutes');
const quoteRoutes        = require('./routes/quoteRoutes');
const workReportRoutes   = require('./routes/workReportRoutes');
const productRoutes      = require('./routes/productRoutes');
const workChecklistRoutes = require('./routes/workChecklistRoutes');

// ── Connect DB ───────────────────────────────────────
connectDB();

const app = express();

// ── Security & Utility Middleware ────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global rate limiter (per IP)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  skip: (req) => process.env.NODE_ENV === 'development' || req.path.includes('/tracking'),
  message: { success: false, message: 'Too many requests from this IP. Try again later.' },
}));

// ── Health Check ─────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AC Service API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ───────────────────────────────────────
const registerRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/user`, userRoutes);
  app.use(`${prefix}/services`, serviceRoutes);
  app.use(`${prefix}/bookings`, bookingRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/amc`, amcRoutes);
  app.use(`${prefix}/amc-plans`, amcRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/complaints`, complaintRoutes);
  app.use(`${prefix}/coupons`, couponRoutes);
  app.use(`${prefix}/tracking`, trackingRoutes);
  app.use(`${prefix}/technicians`, technicianRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/service-otp`, serviceOtpRoutes);
  app.use(`${prefix}/offers`, offerRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/wallet`, walletRoutes);
  app.use(`${prefix}/referrals`, referralRoutes);
  app.use(`${prefix}/rewards`, rewardRoutes);
  app.use(`${prefix}/warranty`, warrantyRoutes);
  app.use(`${prefix}/quotes`, quoteRoutes);
  app.use(`${prefix}/work-reports`, workReportRoutes);
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/work-checklist`, workChecklistRoutes);
};

registerRoutes('/api');
registerRoutes('/api/v1');

// ── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Central Error Handler ────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 AC Service API running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
