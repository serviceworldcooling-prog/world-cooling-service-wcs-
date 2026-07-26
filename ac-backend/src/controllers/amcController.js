const AMCPlan = require('../models/AMCPlan');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────
// GET /api/amc/plans
// All active plans — matches membership-plans.tsx
// ─────────────────────────────────────────
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await AMCPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({ success: true, plans });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/amc/plans/:id
// Single plan detail
// ─────────────────────────────────────────
exports.getPlanById = async (req, res, next) => {
  try {
    const plan = await AMCPlan.findOne({ _id: req.params.id, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.status(200).json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/amc/subscribe/:planId
// Subscribe to a plan — matches handleBuy in membership-plans.tsx
// Deducts from wallet if paymentMethod=wallet, else marks pending
// ─────────────────────────────────────────
exports.subscribePlan = async (req, res, next) => {
  try {
    const { paymentMethod = 'wallet' } = req.body;

    const plan = await AMCPlan.findOne({ _id: req.params.planId, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const user = await User.findById(req.user._id);

    // Wallet payment
    if (paymentMethod === 'wallet') {
      if (user.walletBalance < plan.price) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. Required: $${plan.price}, Available: $${user.walletBalance.toFixed(2)}`,
        });
      }
      user.walletBalance -= plan.price;

      await WalletTransaction.create({
        user: user._id,
        type: 'debit',
        amount: plan.price,
        balanceAfter: user.walletBalance,
        description: `Subscribed to ${plan.name} AMC Plan`,
        source: 'booking_payment',
      });
    }

    // Activate membership
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths);

    user.hasMembership = true;
    user.activePlanId = plan._id;
    user.membershipExpiresAt = expiresAt;
    await user.save();

    await Notification.create({
      user: user._id,
      title: 'Membership Activated',
      message: `You are now enrolled in ${plan.name}. Valid until ${expiresAt.toDateString()}.`,
      type: 'general',
    });

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${plan.name}`,
      membership: {
        plan: plan.name,
        duration: plan.duration,
        expiresAt,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/amc/my-plan
// Current user's active AMC contract — matches amc-details.tsx
// ─────────────────────────────────────────
exports.getMyPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('hasMembership activePlanId membershipExpiresAt')
      .populate('activePlanId', 'name duration price inclusions description');

    if (!user.hasMembership || !user.activePlanId) {
      return res.status(200).json({
        success: true,
        hasMembership: false,
        plan: null,
      });
    }

    // Auto-expire check
    const now = new Date();
    if (user.membershipExpiresAt && user.membershipExpiresAt < now) {
      user.hasMembership = false;
      user.activePlanId = null;
      await user.save();
      return res.status(200).json({ success: true, hasMembership: false, plan: null });
    }

    res.status(200).json({
      success: true,
      hasMembership: true,
      plan: user.activePlanId,
      expiresAt: user.membershipExpiresAt,
    });
  } catch (err) {
    next(err);
  }
};
