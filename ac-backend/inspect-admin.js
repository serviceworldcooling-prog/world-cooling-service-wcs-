const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

connectDB().then(async () => {
  const user = await User.findOne({ email: 'admin@acservice.com' }).select('+password');
  console.log('found', !!user);
  if (user) {
    console.log('passwordHash', user.password);
    console.log('compare', await user.comparePassword('Admin@123456'));
    console.log('role', user.role, 'isActive', user.isActive);
  }
  await mongoose.disconnect();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
