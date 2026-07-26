const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// GET /api/v1/wallet — customer gets balance + transactions
const getWallet = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).select('walletBalance name');
  const { page = 1, limit = 20 } = req.query;

  const filter = { customerId: req.user._id };
  const total        = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return sendSuccess(res, 200, 'Wallet fetched', {
    walletBalance: user.walletBalance,
    transactions,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

// POST /api/v1/wallet/topup — customer adds money to wallet
const topUpWallet = asyncWrapper(async (req, res) => {
  const { amount, method } = req.body;
  if (!amount || amount <= 0) return sendError(res, 400, 'Amount must be greater than 0');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { walletBalance: amount } },
    { new: true }
  ).select('walletBalance');

  await Transaction.create({
    customerId:  req.user._id,
    type:        'wallet_topup',
    amount,
    description: 'Wallet top-up',
    method:      method || 'Card',
    status:      'success',
  });

  return sendSuccess(res, 200, 'Wallet topped up', { walletBalance: user.walletBalance });
});

// GET /api/v1/wallet/transactions — customer transaction history
const getTransactions = asyncWrapper(async (req, res) => {
  const { type, page = 1, limit = 20 } = req.query;
  const filter = { customerId: req.user._id };
  if (type) filter.type = type;

  const total        = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .populate('bookingId', 'service invoiceId')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return sendPaginated(res, transactions, total, page, limit);
});

// GET /api/v1/wallet/all — admin sees all transactions
const getAllTransactions = asyncWrapper(async (req, res) => {
  const { customerId, type, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (customerId) filter.customerId = customerId;
  if (type)       filter.type       = type;
  if (status)     filter.status     = status;

  const total        = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .populate('customerId', 'name phone avatar')
    .populate('bookingId',  'service invoiceId')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return sendPaginated(res, transactions, total, page, limit);
});

module.exports = { getWallet, topUpWallet, getTransactions, getAllTransactions };
