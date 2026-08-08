const WorkChecklist = require('../models/WorkChecklist');

const DEFAULT_WORK_ITEMS = [
  { title: 'Filter Cleaning', category: 'Servicing', displayOrder: 1 },
  { title: 'Gas Charging / Refill', category: 'Servicing', displayOrder: 2 },
  { title: 'Coil Cleaning', category: 'Servicing', displayOrder: 3 },
  { title: 'Fan Motor Replacement', category: 'Replacement', displayOrder: 4 },
  { title: 'PCB / Board Repair', category: 'Repair', displayOrder: 5 },
  { title: 'Capacitor Replacement', category: 'Replacement', displayOrder: 6 },
  { title: 'Gas Leak Repair', category: 'Repair', displayOrder: 7 },
  { title: 'Drain Pipe Cleaning', category: 'Servicing', displayOrder: 8 },
  { title: 'Compressor Service', category: 'Repair', displayOrder: 9 },
  { title: 'Thermostat Check', category: 'Electrical', displayOrder: 10 },
  { title: 'Full Service & Checkup', category: 'Servicing', displayOrder: 11 },
];

// Helper to auto-seed default items if DB is empty
const ensureDefaults = async () => {
  const count = await WorkChecklist.countDocuments();
  if (count === 0) {
    await WorkChecklist.insertMany(DEFAULT_WORK_ITEMS);
  }
};

// ── GET Public / Technician Checklist Options ─────────────────────────────
exports.getPublicChecklist = async (req, res, next) => {
  try {
    await ensureDefaults();
    const items = await WorkChecklist.find({ isActive: true }).sort({ displayOrder: 1, title: 1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET All Admin Checklist Items (Search, Category, Pagination) ────────
exports.getAllChecklistAdmin = async (req, res, next) => {
  try {
    await ensureDefaults();
    const { search, category, activeOnly } = req.query;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (activeOnly === 'true') {
      query.isActive = true;
    }

    const items = await WorkChecklist.find(query).sort({ displayOrder: 1, title: 1 });
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST Create New Work Option ──────────────────────────────────────────
exports.createChecklistAdmin = async (req, res, next) => {
  try {
    const { title, category, isActive, displayOrder } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const existing = await WorkChecklist.findOne({ title: title.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Work option with this title already exists' });
    }

    const newItem = await WorkChecklist.create({
      title: title.trim(),
      category: category || 'Servicing',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: displayOrder ? Number(displayOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Work option created successfully',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

// ── PUT Update Work Option ───────────────────────────────────────────────
exports.updateChecklistAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, isActive, displayOrder } = req.body;

    const item = await WorkChecklist.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Work option not found' });
    }

    if (title && title.trim() !== item.title) {
      const existing = await WorkChecklist.findOne({ title: title.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another work option with this title already exists' });
      }
      item.title = title.trim();
    }

    if (category) item.category = category;
    if (isActive !== undefined) item.isActive = Boolean(isActive);
    if (displayOrder !== undefined) item.displayOrder = Number(displayOrder);

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Work option updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE Work Option ──────────────────────────────────────────────────
exports.deleteChecklistAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await WorkChecklist.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Work option not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Work option deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
