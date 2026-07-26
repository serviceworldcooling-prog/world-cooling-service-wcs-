const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const FAQ = require('../models/FAQ');

// ─────────────────────────────────────────
// POST /api/complaints
// Raise a new complaint ticket
// Matches handleRaiseComplaint in support.tsx
// ─────────────────────────────────────────
exports.createComplaint = async (req, res, next) => {
  try {
    const { subject, description, bookingId } = req.body;

    const complaint = await Complaint.create({
      customer: req.user._id,
      subject,
      description,
      booking: bookingId || null,
    });

    await Notification.create({
      user: req.user._id,
      title: 'Complaint Registered',
      message: `Ticket ${complaint.ticketNumber} filed. Our team will respond within 2 hours.`,
      type: 'general',
      refId: complaint.ticketNumber,
    });

    res.status(201).json({
      success: true,
      message: `Complaint filed. Ticket ID: ${complaint.ticketNumber}`,
      complaint: {
        _id: complaint._id,
        ticketNumber: complaint.ticketNumber,
        subject: complaint.subject,
        status: complaint.status,
        timeline: complaint.timeline,
        createdAt: complaint.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/complaints
// All complaints for logged-in user
// ─────────────────────────────────────────
exports.getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('booking', 'bookingId serviceType preferredDate');

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/complaints/:id
// Complaint detail with timeline
// Matches complaint-status.tsx screen
// ─────────────────────────────────────────
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      customer: req.user._id,
    }).populate('booking', 'bookingId serviceType preferredDate');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/complaints/ticket/:ticketNumber
// Lookup by ticket number (shown on complaint-status header)
// ─────────────────────────────────────────
exports.getComplaintByTicket = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      ticketNumber: req.params.ticketNumber,
      customer: req.user._id,
    }).populate('booking', 'bookingId serviceType');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/complaints/faqs
// FAQ list — matches FAQS data in support.tsx
// ─────────────────────────────────────────
exports.getFaqs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, faqs });
  } catch (err) {
    next(err);
  }
};
