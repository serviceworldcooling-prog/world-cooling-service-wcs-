const Notification = require('../models/Notification');
const User         = require('../models/User');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/admin/notifications/broadcast
// Admin sends a notification to all customers / technicians / a single user
// ─────────────────────────────────────────────────────────────────────────────
const broadcast = asyncWrapper(async (req, res) => {
  const { title, body, type, targetAudience, targetUserId, imageUrl } = req.body;

  if (!title || !body || !type || !targetAudience) {
    return sendError(res, 400, 'title, body, type, and targetAudience are required');
  }

  const validAudiences = ['all', 'customers', 'technicians', 'single'];
  if (!validAudiences.includes(targetAudience)) {
    return sendError(res, 400, `targetAudience must be one of: ${validAudiences.join(', ')}`);
  }

  if (targetAudience === 'single' && !targetUserId) {
    return sendError(res, 400, 'targetUserId is required for single audience');
  }

  // Determine which users to notify
  let recipientIds = [];

  if (targetAudience === 'single') {
    const user = await User.findById(targetUserId).select('_id');
    if (!user) return sendError(res, 404, 'Target user not found');
    recipientIds = [targetUserId];
  } else {
    const roleFilter = targetAudience === 'all'
      ? {}
      : { role: targetAudience === 'customers' ? 'customer' : 'technician' };

    const users = await User.find(roleFilter).select('_id');
    recipientIds = users.map(u => u._id.toString());
  }

  // Create one notification document per recipient (for per-user read tracking)
  const docs = recipientIds.map(userId => ({
    user:    userId,
    title,
    message: body,
    type:    type || 'general',
    isRead:  false,
    refId:   null,
  }));

  await Notification.insertMany(docs, { ordered: false });

  return sendSuccess(res, 201, `Notification sent to ${recipientIds.length} user(s)`, {
    sentCount: recipientIds.length,
    targetAudience,
    title,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/notifications — admin sees all notifications sent
// ─────────────────────────────────────────────────────────────────────────────
const getAll = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;

  // Get a distinct list by finding unique (title + createdAt) — or just list raw
  const total         = await Notification.countDocuments();
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return sendPaginated(res, notifications, total, page, limit);
});

module.exports = { broadcast, getAll };
