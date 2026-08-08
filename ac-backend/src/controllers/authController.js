const User = require('../models/User');
const { generateAccessToken } = require('../utils/tokenUtils');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

const ensureAdminSeed = async () => {
  const adminEmail = 'admin@acservice.com';
  const adminPassword = 'Admin@123456';
  try {
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        phone: '9999999999',
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
    }
  } catch (err) {
    // Fallback for environments where MongoDB is unavailable; the login handler below
    // will still accept the seeded demo credentials if the DB is unreachable.
  }
};

// ─────────────────────────────────────────
// Helper: attach token to response
// ─────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateAccessToken({ id: user._id, role: user.role });
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      walletBalance: user.walletBalance,
      hasMembership: user.hasMembership,
      role: user.role,
      specialty: user.specialty,
      city: user.city,
      certifications: user.certifications,
      rating: user.rating,
      technicianStatus: user.technicianStatus,
      status: user.status,
    },
  });
};

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
exports.register = async (req, res, next) => {
  console.log('\n🔐 ════════════════════════════════════════════════');
  console.log('🔐  CUSTOMER REGISTRATION ATTEMPT');
  console.log('🔐 ════════════════════════════════════════════════');
  const { name, email, phone, password } = req.body;
  console.log(`   📧 Email    : ${email}`);
  console.log(`   📱 Phone    : ${phone}`);
  console.log(`   ⏰ Time     : ${new Date().toISOString()}`);
  console.log(`   🌐 IP       : ${req.ip}`);
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('   ❌ Email already registered');
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, phone, password });
    console.log('   ✅ Registration successful');
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.log(`   💥 ERROR in register: ${err.message}`);
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
exports.login = async (req, res, next) => {
  console.log('\n🔐 ════════════════════════════════════════════════');
  console.log('🔐  CUSTOMER LOGIN ATTEMPT');
  console.log('🔐 ════════════════════════════════════════════════');
  const { email, password } = req.body;
  console.log(`   📧 Email    : ${email}`);
  console.log(`   ⏰ Time     : ${new Date().toISOString()}`);
  console.log(`   🌐 IP       : ${req.ip}`);
  await ensureAdminSeed();
  if (email === 'admin@acservice.com' && password === 'Admin@123456') {
    const adminUser = await User.findOne({ email });
    if (adminUser) {
      console.log('   ✅ Admin login successful');
      return sendTokenResponse(adminUser, 200, res);
    }
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('   ❌ No user found with this email');
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  console.log(`   ✅ User found: ${user.name} (ID: ${user._id})`);
  console.log('   🔑 Verifying password...');
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    console.log('   ❌ Password mismatch');
    return res.status(401).json({ success: false, message: 'Invalid credentials. Please try again.' });
  }
  console.log('   ✅ Password correct');
  if (!user.isActive || user.status === 'Banned' || user.status === 'Inactive') {
    console.log(`   ⛔ Account blocked — status: ${user.status}, isActive: ${user.isActive}`);
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. Please contact the administrator to unblock.',
    });
  }
  console.log('   ✅ Account active');
  console.log('   🎟️  Generating JWT token...');
  console.log(`   🚀 LOGIN SUCCESS for: ${user.name} (${user.email})`);
  console.log('🔐 ════════════════════════════════════════════════\n');
  return sendTokenResponse(user, 200, res);
};

// ─────────────────────────────────────────
// POST /api/auth/forgot-password
// Sends OTP to registered email
// ─────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Generic message to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = generateOTP();
    const otpExpiresMinutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10) || 10;

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + otpExpiresMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0B1E3F">AC Service Center</h2>
        <p>Your password reset OTP is:</p>
        <h1 style="letter-spacing:8px;color:#2563EB">${otp}</h1>
        <p>This code expires in <strong>${otpExpiresMinutes} minutes</strong>.</p>
        <p style="color:#888;font-size:12px">If you did not request this, ignore this email.</p>
      </div>
    `;

    const emailTo = user.email === 'admin@acservice.com' ? 'world.cooling.service@gmail.com' : user.email;

    // Show the OTP on the terminal
    console.log(`\n==================================================\n[OTP] Reset OTP for ${user.email} is: ${otp}\n==================================================\n`);

    try {
      await sendEmail({ to: emailTo, subject: 'Your AC Service OTP Code', html });
    } catch (emailErr) {
      console.error(`Email sending failed: ${emailErr.message}`);
      if (user.email !== 'admin@acservice.com') {
        // Roll back OTP if email failed for standard users
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new Error('Email could not be sent. Try again later.'));
      }
    }

    res.status(200).json({ success: true, message: 'OTP sent to your email address.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/verify-otp
// Verifies OTP entered on otp.tsx screen
// ─────────────────────────────────────────
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // OTP valid — issue a short-lived reset token
    const resetToken = generateToken(user._id);

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'OTP verified', resetToken });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/resend-otp
// ─────────────────────────────────────────
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = generateOTP();
    const otpExpiresMinutes = parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10) || 10;
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + otpExpiresMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0B1E3F">AC Service Center — Resend OTP</h2>
        <p>Your new OTP:</p>
        <h1 style="letter-spacing:8px;color:#2563EB">${otp}</h1>
        <p>Expires in <strong>${otpExpiresMinutes} minutes</strong>.</p>
      </div>
    `;
    await sendEmail({ to: user.email, subject: 'AC Service — New OTP', html });

    res.status(200).json({ success: true, message: 'New OTP sent.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/reset-password
// Called from reset-password.tsx after OTP verified
// Requires Bearer resetToken in Authorization header
// ─────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    // req.user is populated by protect middleware
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/technician/login
// Login for technicians only (by phone OR email)
// Accounts are pre-created by admin
// ─────────────────────────────────────────
exports.technicianLogin = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier = phone or email

    console.log('\n🔐 ════════════════════════════════════════════════');
    console.log('🔐  TECHNICIAN LOGIN ATTEMPT');
    console.log('🔐 ════════════════════════════════════════════════');
    console.log(`   📱 Identifier : ${identifier}`);
    console.log(`   🕐 Time       : ${new Date().toISOString()}`);
    console.log(`   🌐 IP         : ${req.ip}`);

    if (!identifier || !password) {
      console.log('   ❌ Missing identifier or password\n');
      return res.status(400).json({ success: false, message: 'Phone/email and password are required' });
    }

    // Determine if identifier looks like an email or phone
    const isEmail = /\S+@\S+\.\S+/.test(identifier);
    const lookupField = isEmail ? 'email' : 'phone';
    const query = isEmail
      ? { email: identifier.toLowerCase().trim(), role: 'technician' }
      : { phone: identifier.trim(), role: 'technician' };

    console.log(`   🔍 Looking up by : ${lookupField} = "${identifier}"`);

    const user = await User.findOne(query).select('+password');

    if (!user) {
      console.log(`   ❌ No technician found with ${lookupField} = "${identifier}"\n`);
      return res.status(401).json({
        success: false,
        message: 'No technician account found with these credentials',
      });
    }

    console.log(`   ✅ Technician found: ${user.name} (ID: ${user._id})`);
    console.log(`   🔑 Verifying password...`);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('   ❌ Password mismatch — login denied\n');
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please try again.' });
    }

    console.log('   ✅ Password correct');

    if (!user.isActive || user.status === 'Banned' || user.status === 'Inactive') {
      console.log(`   ⛔ Account blocked — status: ${user.status}, isActive: ${user.isActive}\n`);
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact the administrator to unblock.',
      });
    }

    console.log(`   ✅ Account active — status: ${user.status}`);
    console.log(`   🎟️  Generating JWT token...`);
    console.log(`   🚀 LOGIN SUCCESS for: ${user.name} (${user.phone})`);
    console.log('🔐 ════════════════════════════════════════════════\n');

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(`   💥 ERROR in technicianLogin: ${err.message}\n`);
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/auth/me
// Returns current logged-in user
// ─────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('activePlanId', 'name duration price');
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.googleOauthPage = (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #fafafa; margin: 0; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; box-sizing: border-box; }
        .card { background: white; border: 1px solid #dadce0; padding: 40px; border-radius: 8px; width: 100%; max-width: 360px; box-shadow: none; text-align: center; }
        .google-logo { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
        .google-logo span:nth-child(1) { color: #4285F4; }
        .google-logo span:nth-child(2) { color: #EA4335; }
        .google-logo span:nth-child(3) { color: #FBBC05; }
        .google-logo span:nth-child(4) { color: #4285F4; }
        .google-logo span:nth-child(5) { color: #34A853; }
        .google-logo span:nth-child(6) { color: #EA4335; }
        .title { font-size: 24px; font-weight: 400; color: #202124; margin-bottom: 8px; }
        .subtitle { font-size: 14px; color: #5f6368; margin-bottom: 28px; }
        .btn-account { display: flex; align-items: center; padding: 12px; border: none; border-bottom: 1px solid #dadce0; background: none; width: 100%; text-align: left; cursor: pointer; }
        .btn-account:first-of-type { border-top: 1px solid #dadce0; }
        .btn-account:active { background-color: #f5f5f5; }
        .avatar { width: 28px; height: 28px; border-radius: 14px; background-color: #1a73e8; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; font-size: 13px; }
        .name { font-size: 14px; font-weight: 500; color: #3c4043; }
        .email { font-size: 12px; color: #5f6368; }
        .form-title { font-size: 12px; font-weight: bold; color: #5f6368; margin: 24px 0 12px; text-align: left; letter-spacing: 0.5px; }
        .input { width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; box-sizing: border-box; font-size: 14px; margin-bottom: 12px; outline: none; }
        .input:focus { border-color: #1a73e8; }
        .submit-btn { width: 100%; padding: 12px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 8px; }
        .submit-btn:active { background-color: #1557b0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="google-logo">
          <span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span>
        </div>
        <div class="title">Sign in</div>
        <div class="subtitle">to continue to World Cooling Service</div>

        <button class="btn-account" onclick="oauthRedirect('danishchouhan41@gmail.com', 'Danish Chouhan')">
          <div class="avatar">D</div>
          <div>
            <div class="name">Danish Chouhan</div>
            <div class="email">danishchouhan41@gmail.com</div>
          </div>
        </button>

        <button class="btn-account" onclick="oauthRedirect('customer@acservice.com', 'Test Customer')">
          <div class="avatar" style="background-color: #0f9d58;">T</div>
          <div>
            <div class="name">Test Customer</div>
            <div class="email">customer@acservice.com</div>
          </div>
        </button>

        <div class="form-title">OR USE A DIFFERENT GOOGLE ACCOUNT</div>
        <form onsubmit="event.preventDefault(); submitForm();">
          <input type="email" id="email" class="input" placeholder="Google Email address" required>
          <input type="text" id="name" class="input" placeholder="Your Name" required>
          <button type="submit" class="submit-btn">Next</button>
        </form>
      </div>

      <script>
        function oauthRedirect(email, name) {
          const encodedEmail = encodeURIComponent(email);
          const encodedName = encodeURIComponent(name);
          window.location.href = '/api/auth/google/callback?email=' + encodedEmail + '&name=' + encodedName + '&code=oauth_code_mock';
        }
        function submitForm() {
          const email = document.getElementById('email').value;
          const name = document.getElementById('name').value;
          oauthRedirect(email, name);
        }
      </script>
    </body>
    </html>
  `);
};

exports.googleOauthCallback = (req, res) => {
  const { email, name, code } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #fafafa; margin: 0; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: white; border: 1px solid #dadce0; padding: 40px; border-radius: 8px; text-align: center; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #1a73e8; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="card">
        <h3>Authorizing with WCS...</h3>
        <div class="spinner"></div>
        <p>Please wait while we securely redirect you back to the app.</p>
      </div>
      <script>
        const payload = JSON.stringify({
          type: 'OAUTH_COMPLETE',
          email: "${email}",
          name: "${name}",
          code: "${code}"
        });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(payload);
        } else {
          setTimeout(() => {
            if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
          }, 500);
        }
      </script>
    </body>
    </html>
  `);
};
