const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./src/models/Booking');
const User = require('./src/models/User');

dotenv.config();

async function run() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');

  const user = await User.findOne({ role: 'customer' });
  if (!user) {
    console.log('No customer found in database.');
    process.exit(1);
  }
  console.log('Using customer:', user.email);

  console.log('Creating booking test...');
  try {
    const booking = await Booking.create({
      customerId: user._id,
      serviceType: 'AC Repair',
      preferredDate: '2026-08-01',
      preferredTime: '10:00 AM',
      address: 'Test Address 123',
      price: 150
    });
    console.log('Booking created successfully:', booking.bookingId);
  } catch (err) {
    console.error('Error creating booking:', err);
  } finally {
    await mongoose.connection.close();
    console.log('DB Connection closed.');
  }
}

run();
