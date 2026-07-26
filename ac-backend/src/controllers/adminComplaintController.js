const Complaint    = require('../models/Complaint');
const Notification = require('../models/Notification');
const User         = require('../models/User');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/complaints
// All complaints — search, status, priority filter
// ─────────────────────────────────────────────────────────────────────────────
const getAllComplaints = asyncWrapper(async (req, res) => {
  const { status, priority, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;

  if (search) {
    filter.$or = [
      { subject:     { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { ticketNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const total      = await Complaint.countDocuments(filter);
  const complaints = await Complaint.find(filter)
    .populate('customer', 'name phone avatar email')
    .populate('booking',  'serviceType preferredDate bookingId')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return sendPaginated(res, complaints, total, page, limit);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/complaints/:id
// ─────────────────────────────────────────────────────────────────────────────
const getComplaintById = asyncWrapper(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('customer', 'name phone avatar email')
    .populate('booking',  'serviceType preferredDate bookingId address');

  if (!complaint) return sendError(res, 404, 'Complaint not found');
  return sendSuccess(res, 200, 'Complaint fetched', { complaint });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/admin/complaints/:id/status
// Update complaint status — Open → In Progress → Resolved → Closed
// ─────────────────────────────────────────────────────────────────────────────
const updateStatus = asyncWrapper(async (req, res) => {
  const { status, adminNote, priority } = req.body;
  const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  if (!validStatuses.includes(status)) {
    return sendError(res, 400, `Invalid status. One of: ${validStatuses.join(', ')}`);
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return sendError(res, 404, 'Complaint not found');

  complaint.status = status;
  if (adminNote !== undefined) complaint.adminNote = adminNote;
  if (priority  !== undefined) complaint.priority  = priority;

  if (status === 'Resolved' || status === 'Closed') {
    complaint.resolvedAt = new Date();

    // Update timeline step
    const lastStep = complaint.timeline[complaint.timeline.length - 1];
    if (lastStep) {
      lastStep.done        = true;
      lastStep.completedAt = new Date();
    }

    // Notify customer
    await Notification.create({
      user:    complaint.customer,
      title:   `Complaint ${status}`,
      message: `Your complaint ticket ${complaint.ticketNumber} has been ${status.toLowerCase()}.`,
      type:    'general',
      refId:   complaint.ticketNumber,
    }).catch(() => {});
  }

  if (status === 'In Progress') {
    // Advance timeline step 2
    if (complaint.timeline[1]) {
      complaint.timeline[1].done        = true;
      complaint.timeline[1].completedAt = new Date();
    }
  }

  await complaint.save();

  const updated = await Complaint.findById(complaint._id)
    .populate('customer', 'name phone avatar');

  return sendSuccess(res, 200, `Complaint status updated to ${status}`, { complaint: updated });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/admin/complaints/:id/note
// Admin saves internal note without changing status
// ─────────────────────────────────────────────────────────────────────────────
const saveAdminNote = asyncWrapper(async (req, res) => {
  const { adminNote } = req.body;
  if (adminNote === undefined) return sendError(res, 400, 'adminNote is required');

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { adminNote },
    { new: true }
  ).populate('customer', 'name phone avatar');

  if (!complaint) return sendError(res, 404, 'Complaint not found');
  return sendSuccess(res, 200, 'Note saved', { complaint });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/admin/complaints/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteComplaint = asyncWrapper(async (req, res) => {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);
  if (!complaint) return sendError(res, 404, 'Complaint not found');
  return sendSuccess(res, 200, 'Complaint deleted');
});

module.exports = {
  getAllComplaints, getComplaintById, updateStatus, saveAdminNote, deleteComplaint,
};
