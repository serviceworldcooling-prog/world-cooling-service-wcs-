const Notification = require('../models/Notification');

// ─────────────────────────────────────────
// GET /api/notifications
// All notifications for the logged-in user
// Matches notifications.tsx list
// ─────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user._id }),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      total,
      unreadCount,
      page,
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/notifications/mark-all-read
// Matches "Mark all read" button in notifications.tsx
// ─────────────────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/notifications/:id/read
// Mark single notification as read
// ─────────────────────────────────────────
exports.markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};
