const User = require('../models/User');

// ─────────────────────────────────────────
// GET /api/user/profile
// ─────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('activePlanId', 'name duration price inclusions');

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/user/profile
// Editable fields: name, phone, avatar
// ─────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, city, state, pincode, address, latitude, longitude, addressString } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar, city, state, pincode, address, latitude, longitude, addressString },
      { new: true, runValidators: true }
    ).populate('activePlanId', 'name duration price');

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET /api/user/addresses
// ─────────────────────────────────────────
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/user/addresses
// ─────────────────────────────────────────
exports.addAddress = async (req, res, next) => {
  try {
    const { label, address, city, lat, lng, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    // If this address is set as default, un-default all others
    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses.push({ label, address, city, lat, lng, isDefault: isDefault || false });
    await user.save();

    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// PUT /api/user/addresses/:addressId
// ─────────────────────────────────────────
exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { label, address, city, lat, lng, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    const addr = user.addresses.id(addressId);
    if (!addr) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If setting this as default, clear others
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    addr.label = label ?? addr.label;
    addr.address = address ?? addr.address;
    addr.city = city ?? addr.city;
    addr.lat = lat ?? addr.lat;
    addr.lng = lng ?? addr.lng;
    addr.isDefault = isDefault ?? addr.isDefault;

    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// DELETE /api/user/addresses/:addressId
// ─────────────────────────────────────────
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);

    const addr = user.addresses.id(addressId);
    if (!addr) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    addr.deleteOne();
    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};
