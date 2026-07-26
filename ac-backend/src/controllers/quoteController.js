const Quote = require('../models/Quote');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// POST /api/v1/quotes — customer requests a custom quote
const createQuote = asyncWrapper(async (req, res) => {
  const { serviceType, description, location, isCommercial } = req.body;
  if (!serviceType || !description || !location) {
    return sendError(res, 400, 'serviceType, description, and location are required');
  }
  const quote = await Quote.create({
    customerId:  req.user._id,
    serviceType, description, location,
    isCommercial: isCommercial || false,
  });
  return sendSuccess(res, 201, 'Quote request submitted. Admin will respond shortly.', { quote });
});

// GET /api/v1/quotes/my — customer
const getMyQuotes = asyncWrapper(async (req, res) => {
  const quotes = await Quote.find({ customerId: req.user._id })
    .populate('assignedTechnician', 'name phone')
    .sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Quotes fetched', { quotes });
});

// GET /api/v1/quotes — admin
const getAllQuotes = asyncWrapper(async (req, res) => {
  const { status, isCommercial, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status)       filter.status       = status;
  if (isCommercial !== undefined) filter.isCommercial = isCommercial === 'true';

  const total  = await Quote.countDocuments(filter);
  const quotes = await Quote.find(filter)
    .populate('customerId',          'name phone avatar')
    .populate('assignedTechnician',  'name phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, quotes, total, page, limit);
});

// PUT /api/v1/quotes/:id — admin responds to quote
const respondToQuote = asyncWrapper(async (req, res) => {
  const { status, quotedAmount, assignedTechnician, notes, adminReply } = req.body;
  const updates = {};
  if (status)              updates.status              = status;
  if (quotedAmount)        updates.quotedAmount        = quotedAmount;
  if (assignedTechnician)  updates.assignedTechnician  = assignedTechnician;
  if (notes)               updates.notes               = notes;
  if (adminReply)          updates.adminReply          = adminReply;
  updates.respondedAt = new Date();

  const quote = await Quote.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate('customerId', 'name phone');
  if (!quote) return sendError(res, 404, 'Quote not found');
  return sendSuccess(res, 200, 'Quote updated', { quote });
});

// PUT /api/v1/quotes/:id/accept — customer accepts quoted price
const acceptQuote = asyncWrapper(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return sendError(res, 404, 'Quote not found');
  if (quote.customerId.toString() !== req.user._id.toString()) return sendError(res, 403, 'Access denied');
  if (quote.status !== 'Quoted') return sendError(res, 400, 'Quote must be in Quoted state to accept');

  quote.status = 'Accepted';
  await quote.save();
  return sendSuccess(res, 200, 'Quote accepted', { quote });
});

module.exports = { createQuote, getMyQuotes, getAllQuotes, respondToQuote, acceptQuote };
