const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const User = require('./src/models/User');
const { generateAccessToken } = require('./src/utils/tokenUtils');

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

  const token = generateAccessToken({ id: user._id, role: user.role });
  console.log('Generated token for customer:', user.email);

  await mongoose.connection.close();

  console.log('Sending POST /api/v1/bookings request...');
  try {
    const res = await axios.post('http://localhost:5000/api/v1/bookings', {
      serviceType: 'AC Repair',
      preferredDate: '2026-08-01',
      preferredTime: '10:00 AM',
      address: 'Test Address 123',
      price: 150
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Response Status:', res.status);
    console.log('Response Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('API Error Response Status:', err.response.status);
      console.error('API Error Response Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('API Error:', err.message);
    }
  }
}

run();
