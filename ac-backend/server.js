require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes        = require('./src/routes/authRoutes');
const bookingRoutes     = require('./src/routes/bookingRoutes');
const serviceOtpRoutes  = require('./src/routes/serviceOtpRoutes');
const serviceRoutes     = require('./src/routes/serviceRoutes');
const amcRoutes         = require('./src/routes/amcRoutes');
const offerRoutes       = require('./src/routes/offerRoutes');
const reviewRoutes      = require('./src/routes/reviewRoutes');
const complaintRoutes   = require('./src/routes/complaintRoutes');
const walletRoutes      = require('./src/routes/walletRoutes');
const referralRoutes    = require('./src/routes/referralRoutes');
const rewardRoutes      = require('./src/routes/rewardRoutes');
const warrantyRoutes    = require('./src/routes/warrantyRoutes');
const quoteRoutes       = require('./src/routes/quoteRoutes');
const workReportRoutes  = require('./src/routes/workReportRoutes');
const notificationRoutes= require('./src/routes/notificationRoutes');
const adminRoutes       = require('./src/routes/adminRoutes');
const technicianRoutes  = require('./src/routes/technicianRoutes');
const productRoutes     = require('./src/routes/productRoutes');
const workChecklistRoutes = require('./src/routes/workChecklistRoutes');

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security & General Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 5000,
  skip: (req) => process.env.NODE_ENV === 'development' || req.path.includes('/tracking'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AC Service API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/bookings`,      bookingRoutes);
app.use(`${API}/service-otp`,   serviceOtpRoutes);
app.use(`${API}/services`,      serviceRoutes);
app.use(`${API}/amc-plans`,     amcRoutes);
app.use(`${API}/offers`,        offerRoutes);
app.use(`${API}/reviews`,       reviewRoutes);
app.use(`${API}/complaints`,    complaintRoutes);
app.use(`${API}/wallet`,        walletRoutes);
app.use(`${API}/referrals`,     referralRoutes);
app.use(`${API}/rewards`,       rewardRoutes);
app.use(`${API}/warranty`,      warrantyRoutes);
app.use(`${API}/quotes`,        quoteRoutes);
app.use(`${API}/work-reports`,  workReportRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/admin`,         adminRoutes);
app.use(`${API}/technicians`,   technicianRoutes);
app.use(`${API}/products`,      productRoutes);
app.use(`${API}/work-checklist`,  workChecklistRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── CRON: Auto-delete expired Service OTPs (runs every minute) ───────────────
const ServiceOTP = require('./src/models/ServiceOTP');
cron.schedule('* * * * *', async () => {
  try {
    const result = await ServiceOTP.deleteMany({ expiresAt: { $lt: new Date() } });
    if (result.deletedCount > 0) {
      console.log(`🧹 Cron: Deleted ${result.deletedCount} expired service OTP(s)`);
    }
  } catch (err) {
    console.error('Cron OTP cleanup error:', err.message);
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 AC Service API running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Base URL    : http://localhost:${PORT}/api/v1\n`);
});

module.exports = app;
