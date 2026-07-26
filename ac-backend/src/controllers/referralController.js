const Referral    = require('../models/Referral');
const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// GET /api/v1/referrals/my — customer's own referral info
const getMyReferrals = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).select('referralCode walletBalance');
  const { page = 1, limit = 10 } = req.query;

  const filter  = { referrerId: req.user._id };
  const total   = await Referral.countDocuments(filter);
  const refs    = await Referral.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));

  const totalEarned = refs.filter(r => r.rewardPaid).reduce((s, r) => s + r.rewardAmount, 0);

  return sendSuccess(res, 200, 'Referrals fetched', {
    referralCode: user.referralCode,
    walletBalance: user.walletBalance,
    totalEarned,
    referrals: refs,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

// POST /api/v1/referrals/complete — admin marks referral complete and pays reward
const completeReferral = asyncWrapper(async (req, res) => {
  const { referralId, bookingId } = req.body;
  const referral = await Referral.findById(referralId);
  if (!referral)             return sendError(res, 404, 'Referral not found');
  if (referral.status !== 'Pending') return sendError(res, 400, 'Referral is not in Pending state');

  referral.status      = 'Completed';
  referral.rewardPaid  = true;
  referral.bookingId   = bookingId || null;
  referral.completedAt = new Date();
  await referral.save();

  // Credit reward to referrer's wallet
  await User.findByIdAndUpdate(referral.referrerId, { $inc: { walletBalance: referral.rewardAmount } });
  await Transaction.create({
    customerId:  referral.referrerId,
    type:        'credit',
    amount:      referral.rewardAmount,
    description: `Referral reward — ${referral.referredName} completed first booking`,
    method:      'Wallet',
    status:      'success',
  });

  return sendSuccess(res, 200, 'Referral completed, reward credited', { referral });
});

// GET /api/v1/referrals — admin
const getAllReferrals = asyncWrapper(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const total = await Referral.countDocuments(filter);
  const refs  = await Referral.find(filter)
    .populate('referrerId', 'name phone avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, refs, total, page, limit);
});

module.exports = { getMyReferrals, completeReferral, getAllReferrals };
