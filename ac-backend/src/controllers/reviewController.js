const Review  = require('../models/Review');
const Booking = require('../models/Booking');
const User    = require('../models/User');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// POST /api/v1/reviews — customer submits review after completed booking
const createReview = asyncWrapper(async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  if (!bookingId || !rating) return sendError(res, 400, 'bookingId and rating are required');

  const booking = await Booking.findById(bookingId);
  if (!booking) return sendError(res, 404, 'Booking not found');
  if (booking.customerId.toString() !== req.user._id.toString()) return sendError(res, 403, 'Access denied');
  if (booking.status !== 'Completed') return sendError(res, 400, 'Can only review completed bookings');

  const existing = await Review.findOne({ bookingId });
  if (existing) return sendError(res, 409, 'Review already submitted for this booking');

  const review = await Review.create({
    customerId:   req.user._id,
    technicianId: booking.technicianId,
    bookingId,
    service:      booking.service,
    rating,
    comment: comment || '',
  });

  // Update technician avg rating
  if (booking.technicianId) {
    const reviews = await Review.find({ technicianId: booking.technicianId, isPublished: true });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(booking.technicianId, { rating: Math.round(avg * 10) / 10 });
  }

  return sendSuccess(res, 201, 'Review submitted', { review });
});

// GET /api/v1/reviews/my — customer
const getMyReviews = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { customerId: req.user._id };
  const total   = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('technicianId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, reviews, total, page, limit);
});

// GET /api/v1/reviews/technician/:technicianId — public
const getTechnicianReviews = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { technicianId: req.params.technicianId, isPublished: true };
  const total   = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('customerId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, reviews, total, page, limit);
});

// GET /api/v1/reviews — admin (all reviews)
const getAllReviews = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 20, isPublished } = req.query;
  const filter = {};
  if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
  const total   = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('customerId',   'name avatar')
    .populate('technicianId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, reviews, total, page, limit);
});

// PUT /api/v1/reviews/:id/reply — admin replies to review
const replyToReview = asyncWrapper(async (req, res) => {
  const { reply } = req.body;
  const review = await Review.findByIdAndUpdate(req.params.id, { reply, replyAt: new Date() }, { new: true });
  if (!review) return sendError(res, 404, 'Review not found');
  return sendSuccess(res, 200, 'Reply added', { review });
});

// PUT /api/v1/reviews/:id/toggle-publish — admin
const togglePublish = asyncWrapper(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return sendError(res, 404, 'Review not found');
  review.isPublished = !review.isPublished;
  await review.save();
  return sendSuccess(res, 200, `Review ${review.isPublished ? 'published' : 'unpublished'}`, { review });
});

module.exports = { createReview, getMyReviews, getTechnicianReviews, getAllReviews, replyToReview, togglePublish };
