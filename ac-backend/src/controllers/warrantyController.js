const Warranty = require('../models/Warranty');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseUtils');

// GET /api/v1/warranty/my — customer
const getMyWarranties = asyncWrapper(async (req, res) => {
  const warranties = await Warranty.find({ customerId: req.user._id })
    .populate('bookingId',    'service date invoiceId')
    .populate('technicianId', 'name phone')
    .sort({ createdAt: -1 });

  // Auto-expire in-memory check
  warranties.forEach(w => {
    if (w.status === 'Active' && new Date() > w.endDate) w.status = 'Expired';
  });

  return sendSuccess(res, 200, 'Warranties fetched', { warranties });
});

// POST /api/v1/warranty/claim — customer files a claim
const claimWarranty = asyncWrapper(async (req, res) => {
  const { warrantyId, claimReason } = req.body;
  if (!warrantyId || !claimReason) return sendError(res, 400, 'warrantyId and claimReason are required');

  const warranty = await Warranty.findById(warrantyId);
  if (!warranty) return sendError(res, 404, 'Warranty not found');
  if (warranty.customerId.toString() !== req.user._id.toString()) return sendError(res, 403, 'Access denied');
  if (warranty.status !== 'Active') return sendError(res, 400, `Warranty is ${warranty.status}`);
  if (new Date() > warranty.endDate) return sendError(res, 400, 'Warranty has expired');

  warranty.status      = 'Claimed';
  warranty.claimDate   = new Date();
  warranty.claimReason = claimReason;
  await warranty.save();

  return sendSuccess(res, 200, 'Warranty claim submitted', { warranty });
});

// GET /api/v1/warranty — admin
const getAllWarranties = asyncWrapper(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const total      = await Warranty.countDocuments(filter);
  const warranties = await Warranty.find(filter)
    .populate('customerId',   'name phone avatar')
    .populate('bookingId',    'service date invoiceId')
    .populate('technicianId', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return sendPaginated(res, warranties, total, page, limit);
});

// POST /api/v1/warranty — admin creates warranty after booking completion
const createWarranty = asyncWrapper(async (req, res) => {
  const warranty = await Warranty.create(req.body);
  return sendSuccess(res, 201, 'Warranty created', { warranty });
});

// PUT /api/v1/warranty/:id — admin
const updateWarranty = asyncWrapper(async (req, res) => {
  const warranty = await Warranty.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!warranty) return sendError(res, 404, 'Warranty not found');
  return sendSuccess(res, 200, 'Warranty updated', { warranty });
});

module.exports = { getMyWarranties, claimWarranty, getAllWarranties, createWarranty, updateWarranty };
