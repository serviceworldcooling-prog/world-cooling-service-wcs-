const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * protect — verifies JWT, attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!user.isActive || user.status === 'Banned' || user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact the administrator to unblock.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
  }
};

/**
 * restrictTo — role-based access control
 * Usage: restrictTo('admin'), restrictTo('admin', 'technician')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role(s): ${roles.join(', ')}`,
    });
  }
  next();
};

/**
 * optionalAuth — attaches req.user if token present, but does NOT block
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch (_) {
    // token invalid — continue as unauthenticated
  }
  next();
};

module.exports = { protect, restrictTo, optionalAuth };
