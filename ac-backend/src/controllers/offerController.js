const Offer = require('../models/Offer');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseUtils');

// GET /api/v1/offers — public (active only)
const getActiveOffers = asyncWrapper(async (req, res) => {
  const offers = await Offer.find({ isActive: true, expiry: { $gte: new Date() } }).sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Offers fetched', { offers });
});

// GET /api/v1/offers/all — admin
const getAllOffers = asyncWrapper(async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'All offers', { offers });
});

// POST /api/v1/offers/validate — customer validates a coupon code
const validateOffer = asyncWrapper(async (req, res) => {
  const { code, orderValue } = req.body;
  if (!code) return sendError(res, 400, 'Coupon code is required');

  const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });
  if (!offer)                             return sendError(res, 404, 'Invalid or inactive coupon code');
  if (new Date() > offer.expiry)         return sendError(res, 400, 'Coupon has expired');
  if (offer.usageCount >= offer.maxUsage) return sendError(res, 400, 'Coupon usage limit reached');
  if (orderValue && orderValue < offer.minOrderValue) {
    return sendError(res, 400, `Minimum order value ₹${offer.minOrderValue} required for this coupon`);
  }

  const discount = offer.discountType === 'percent'
    ? Math.floor(((orderValue || 0) * offer.discount) / 100)
    : offer.discount;

  return sendSuccess(res, 200, 'Coupon valid', {
    offer,
    discountAmount: discount,
    finalPrice: Math.max(0, (orderValue || 0) - discount),
  });
});

// POST /api/v1/offers — admin
const createOffer = asyncWrapper(async (req, res) => {
  const offer = await Offer.create(req.body);
  return sendSuccess(res, 201, 'Offer created', { offer });
});

// PUT /api/v1/offers/:id — admin
const updateOffer = asyncWrapper(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!offer) return sendError(res, 404, 'Offer not found');
  return sendSuccess(res, 200, 'Offer updated', { offer });
});

// DELETE /api/v1/offers/:id — admin
const deleteOffer = asyncWrapper(async (req, res) => {
  await Offer.findByIdAndDelete(req.params.id);
  return sendSuccess(res, 200, 'Offer deleted');
});

module.exports = { getActiveOffers, getAllOffers, validateOffer, createOffer, updateOffer, deleteOffer };
