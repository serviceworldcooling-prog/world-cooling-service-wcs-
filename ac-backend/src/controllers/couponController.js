const Coupon = require('../models/Coupon');

// ─────────────────────────────────────────
// GET /api/coupons
// All active, non-expired coupons
// Matches coupons.tsx screen
// ─────────────────────────────────────────
exports.getCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .select('-usedBy');  // Don't expose user list

    res.status(200).json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/coupons/apply
// Validate coupon & return discount amount
// Called before payment — matches Apply coupon in payment-preview
// ─────────────────────────────────────────
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found or expired' });
    }

    // Usage limit check
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Already used by this user
    const alreadyUsed = coupon.usedBy.some(id => id.toString() === req.user._id.toString());
    if (alreadyUsed) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }

    // Min order check
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon`,
      });
    }

    // Calculate discount
    let discountAmount;
    if (coupon.discountType === 'percent') {
      discountAmount = (orderAmount * coupon.discount) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discount;
    }

    discountAmount = parseFloat(Math.min(discountAmount, orderAmount).toFixed(2));
    const finalAmount = parseFloat((orderAmount - discountAmount).toFixed(2));

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discount: coupon.discount,
      },
      discountAmount,
      finalAmount,
    });
  } catch (err) {
    next(err);
  }
};
