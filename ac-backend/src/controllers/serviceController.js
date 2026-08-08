const Service = require('../models/Service');

// ─────────────────────────────────────────
// GET /api/services
// All active services with optional category filter & search
// ─────────────────────────────────────────
exports.getServices = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(query).sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: services.length, services });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/services/categories
// Returns distinct category list with counts (for home screen categories grid)
// ─────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          icon: { $first: '$icon' },
          basePrice: { $min: '$basePrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = categories.map(c => ({
      id: c._id,
      title: c._id,
      icon: c.icon,
      serviceCount: c.count,
      startingFrom: c.basePrice,
    }));

    res.status(200).json({ success: true, categories: formatted });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/services/:id
// Single service detail — maps to service-details screen
// ─────────────────────────────────────────
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, isActive: true });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const {
      title,
      description,
      icon,
      image,
      basePrice,
      category,
      inclusions,
      estimatedTime,
      isActive,
      isFeatured,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required' });
    }

    const service = await Service.create({
      title,
      description,
      icon,
      image,
      basePrice,
      category,
      inclusions,
      estimatedTime,
      isActive,
      isFeatured,
    });

    res.status(201).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const service = await Service.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getPublicTechnicians = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const technicians = await User.find({ role: 'technician' }).select('name avatar phone specialty rating reviewsCount');
    res.status(200).json({ success: true, count: technicians.length, technicians });
  } catch (err) {
    next(err);
  }
};
