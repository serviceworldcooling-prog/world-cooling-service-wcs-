const Booking = require('../models/Booking');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');

// ─────────────────────────────────────────
// Helper: record a wallet transaction & update user balance
// ─────────────────────────────────────────
const recordWalletTx = async (userId, type, amount, description, source, refId = null) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const balanceAfter =
    type === 'credit'
      ? user.walletBalance + amount
      : user.walletBalance - amount;

  if (balanceAfter < 0) throw new Error('Insufficient wallet balance');

  user.walletBalance = balanceAfter;
  await user.save();

  await WalletTransaction.create({
    user: userId,
    type,
    amount,
    balanceAfter,
    description,
    source,
    refId,
  });

  return balanceAfter;
};

// ─────────────────────────────────────────
// GET /api/payments/preview/:bookingId
// Returns invoice summary before payment
// Matches payment-preview.tsx screen
// ─────────────────────────────────────────
exports.getPaymentPreview = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Build invoice summary
    const baseAmount = booking.price || 0;
    const tax = parseFloat((baseAmount * 0.05).toFixed(2)); // 5% GST placeholder
    const total = parseFloat((baseAmount + tax).toFixed(2));

    res.status(200).json({
      success: true,
      preview: {
        bookingId: booking.bookingId,
        serviceType: booking.serviceType,
        technicianName: booking.technicianName,
        date: booking.preferredDate,
        time: booking.preferredTime,
        address: booking.address,
        baseAmount,
        tax,
        total,
        isPaid: booking.isPaid,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/payments/pay/:bookingId
// Process payment for a booking
// Matches handlePay in payment-preview.tsx
// paymentMethod: upi | card | wallet | cash
// ─────────────────────────────────────────
exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, couponCode } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.isPaid) {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    let finalAmount = booking.price || 0;

    // Apply coupon discount if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validUntil: { $gte: new Date() },
      });

      if (coupon) {
        const alreadyUsed = coupon.usedBy.some(id => id.toString() === req.user._id.toString());
        if (!alreadyUsed) {
          const discount =
            coupon.discountType === 'percent'
              ? Math.min((finalAmount * coupon.discount) / 100, coupon.maxDiscount || Infinity)
              : coupon.discount;

          finalAmount = Math.max(0, finalAmount - discount);

          // Mark coupon used
          coupon.usedBy.push(req.user._id);
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Wallet payment — debit from balance
    if (paymentMethod === 'wallet') {
      await recordWalletTx(
        req.user._id,
        'debit',
        finalAmount,
        `Paid for booking ${booking.bookingId}`,
        'booking_payment',
        booking.bookingId
      );
    }

    // Mark booking as paid
    booking.isPaid = true;
    booking.paymentMethod = paymentMethod;
    booking.price = finalAmount;
    booking.status = 'Upcoming';
    await booking.save();

    // Payment notification
    await Notification.create({
      user: req.user._id,
      title: 'Payment Successful',
      message: `Payment of $${finalAmount.toFixed(2)} received for booking ${booking.bookingId}.`,
      type: 'payment',
      refId: booking.bookingId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      booking: {
        bookingId: booking.bookingId,
        isPaid: booking.isPaid,
        paymentMethod: booking.paymentMethod,
        price: booking.price,
        status: booking.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/payments/wallet
// Returns wallet balance — matches wallet.tsx
// ─────────────────────────────────────────
exports.getWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    res.status(200).json({ success: true, walletBalance: user.walletBalance });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/payments/wallet/transactions
// Paginated wallet history — matches wallet-transactions.tsx
// ─────────────────────────────────────────
exports.getWalletTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      WalletTransaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WalletTransaction.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      transactions,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/payments/wallet/add
// Add money to wallet — matches Add Money button in wallet.tsx
// ─────────────────────────────────────────
exports.addMoneyToWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const newBalance = await recordWalletTx(
      req.user._id,
      'credit',
      parsed,
      'Money added to wallet',
      'add_money'
    );

    await Notification.create({
      user: req.user._id,
      title: 'Wallet Topped Up',
      message: `$${parsed.toFixed(2)} added to your wallet. New balance: $${newBalance.toFixed(2)}.`,
      type: 'payment',
    });

    res.status(200).json({
      success: true,
      message: 'Money added to wallet',
      walletBalance: newBalance,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/payments/invoice/:bookingId
// Download invoice — matches Download Invoice button in booking-details.tsx
// ─────────────────────────────────────────
exports.getInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user._id,
    }).populate('customer', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const tax = parseFloat((booking.price * 0.05).toFixed(2));

    res.status(200).json({
      success: true,
      invoice: {
        invoiceNumber: `INV-${booking.bookingId}`,
        issuedAt: booking.updatedAt,
        customer: {
          name: booking.customer.name,
          email: booking.customer.email,
          phone: booking.customer.phone,
        },
        service: booking.serviceType,
        technician: booking.technicianName,
        date: booking.preferredDate,
        time: booking.preferredTime,
        address: booking.address,
        baseAmount: booking.price,
        tax,
        total: booking.price + tax,
        paymentMethod: booking.paymentMethod,
        isPaid: booking.isPaid,
      },
    });
  } catch (err) {
    next(err);
  }
};
