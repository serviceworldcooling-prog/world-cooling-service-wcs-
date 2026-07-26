const Reward      = require('../models/Reward');
const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// GET /api/v1/rewards/my — customer
const getMyRewards = asyncWrapper(async (req, res) => {
  let reward = await Reward.findOne({ customerId: req.user._id });
  if (!reward) {
    reward = await Reward.create({ customerId: req.user._id, pointsExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
  }
  return sendSuccess(res, 200, 'Rewards fetched', {
    totalPoints:     reward.totalPoints,
    usedPoints:      reward.usedPoints,
    availablePoints: Math.max(0, reward.totalPoints - reward.usedPoints),
    tier:            reward.tier,
    pointsExpiry:    reward.pointsExpiry,
    redemptions:     reward.redemptions,
  });
});

// POST /api/v1/rewards/redeem — customer redeems points
// 100 points = ₹10 wallet credit (configurable)
const redeemPoints = asyncWrapper(async (req, res) => {
  const { points } = req.body;
  if (!points || points < 100) return sendError(res, 400, 'Minimum 100 points required for redemption');

  const reward = await Reward.findOne({ customerId: req.user._id });
  if (!reward) return sendError(res, 404, 'No reward account found');

  const available = reward.totalPoints - reward.usedPoints;
  if (points > available) return sendError(res, 400, `Only ${available} points available`);

  const walletCredit = Math.floor(points / 10); // 100 pts = ₹10

  reward.usedPoints  += points;
  reward.redemptions += 1;
  reward.lastActivity = new Date();
  await reward.save();

  await User.findByIdAndUpdate(req.user._id, { $inc: { walletBalance: walletCredit } });
  await Transaction.create({
    customerId:  req.user._id,
    type:        'reward_redeem',
    amount:      walletCredit,
    description: `Redeemed ${points} reward points for ₹${walletCredit} wallet credit`,
    method:      'Reward',
    status:      'success',
  });

  return sendSuccess(res, 200, `${points} points redeemed for ₹${walletCredit} wallet credit`, {
    redeemedPoints:  points,
    walletCredit,
    availablePoints: reward.totalPoints - reward.usedPoints,
  });
});

// GET /api/v1/rewards — admin
const getAllRewards = asyncWrapper(async (req, res) => {
  const { tier, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (tier) filter.tier = tier;
  const total   = await Reward.countDocuments(filter);
  const rewards = await Reward.find(filter)
    .populate('customerId', 'name phone avatar')
    .sort({ totalPoints: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, rewards, total, page, limit);
});

module.exports = { getMyRewards, redeemPoints, getAllRewards };
