/**
 * Seed script — run once to populate DB with initial data
 * Usage: node src/config/seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const AMCPlan = require('../models/AMCPlan');
const Service = require('../models/Service');
const Coupon = require('../models/Coupon');
const FAQ = require('../models/FAQ');

const amcPlans = [
  {
    name: 'Silver Care Plan',
    duration: '6 Months',
    durationMonths: 6,
    price: 99,
    description: 'Essential AC maintenance for single unit households.',
    inclusions: [
      '2 free deep jet cleanings',
      '10% discount on all repairs',
      'Priority 4-hour dispatch response',
    ],
  },
  {
    name: 'Gold AMC Care Plan',
    duration: '12 Months',
    durationMonths: 12,
    price: 179,
    description: 'Our most popular plan for families with 1-2 AC units.',
    inclusions: [
      '4 free deep jet cleanings per year',
      'Free repair labor charges for all visits',
      '15% discount on gas top-ups and capacitors',
      'Priority 2-hour dispatch callback response',
    ],
  },
  {
    name: 'Platinum Elite Plan',
    duration: '12 Months',
    durationMonths: 12,
    price: 299,
    description: 'Premium coverage for 3+ AC units or commercial setups.',
    inclusions: [
      'Unlimited free jet cleanings',
      'Free parts up to $100 per visit',
      '20% discount on all gas and electrical work',
      'Dedicated account manager',
      '1-hour emergency response guarantee',
    ],
  },
];

const services = [
  { title: 'AC Service & Cleaning',    category: 'AC Service / Cleaning', icon: 'Wind',          basePrice: 49,  isFeatured: true,  estimatedTime: '1-2 hours',  inclusions: ['Filter cleaning', 'Coil wash', 'Drain flush'] },
  { title: 'AC Repair',                category: 'AC Repair',             icon: 'Wrench',        basePrice: 79,  isFeatured: true,  estimatedTime: '2-3 hours',  inclusions: ['Fault diagnosis', 'Part replacement', 'Testing'] },
  { title: 'Gas Charging (Refill)',    category: 'Gas Charging',          icon: 'Gauge',         basePrice: 69,  isFeatured: false, estimatedTime: '1 hour',     inclusions: ['Gas level check', 'Refrigerant top-up', 'Leak test'] },
  { title: 'AC Installation',         category: 'AC Installation',       icon: 'PlusCircle',    basePrice: 99,  isFeatured: true,  estimatedTime: '2-4 hours',  inclusions: ['Bracket mounting', 'Pipe fitting', 'Electrical wiring', 'Trial run'] },
  { title: 'Water Leakage Fix',       category: 'Water Leakage Fix',     icon: 'Droplets',      basePrice: 59,  isFeatured: false, estimatedTime: '1-2 hours',  inclusions: ['Drain pipe check', 'Seal replacement', 'Test run'] },
  { title: 'Compressor Repair',       category: 'Compressor Repair',     icon: 'Settings',      basePrice: 149, isFeatured: false, estimatedTime: '3-5 hours',  inclusions: ['Compressor diagnosis', 'Motor check', 'Replacement if needed'] },
  { title: 'PCB / Electrical Fault',  category: 'PCB / Electrical Fault',icon: 'Cpu',           basePrice: 89,  isFeatured: false, estimatedTime: '2-3 hours',  inclusions: ['PCB testing', 'Capacitor check', 'Relay inspection'] },
  { title: 'Emergency Breakdown',     category: 'Emergency Breakdown',   icon: 'AlertTriangle', basePrice: 149, isFeatured: true,  estimatedTime: 'Immediate',  inclusions: ['Priority dispatch', '30-min ETA', 'Full diagnosis'] },
];

const coupons = [
  {
    code: 'ACFIRST20',
    title: 'First Booking Discount',
    subtitle: 'Get $20 off on your first AC service booking',
    discount: 20,
    discountType: 'flat',
    minOrderAmount: 49,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  },
  {
    code: 'SUMMER15',
    title: 'Summer Special 15% Off',
    subtitle: 'Cool down this summer with 15% discount on all services',
    discount: 15,
    discountType: 'percent',
    maxDiscount: 30,
    minOrderAmount: 59,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'GAS50',
    title: 'Gas Charging Offer',
    subtitle: '$50 off on gas charging and refill service',
    discount: 50,
    discountType: 'flat',
    minOrderAmount: 69,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

const faqs = [
  { order: 1, question: 'How quickly can a technician arrive?',             answer: 'For standard bookings, technicians arrive within 2-4 hours of confirmation. Emergency bookings get a 25-30 minute dispatch.' },
  { order: 2, question: 'What is included in AC Service & Cleaning?',       answer: 'Our standard service includes filter cleaning, indoor/outdoor coil wash with jet spray, drain flush, and a cooling efficiency check.' },
  { order: 3, question: 'How do I cancel or reschedule my booking?',        answer: 'Open My Bookings, select your booking, and tap Reschedule or Cancel. Cancellations made 2+ hours before the slot are free.' },
  { order: 4, question: 'What payment methods are accepted?',               answer: 'We accept UPI (GPay, PhonePe), credit/debit cards, digital wallet, and cash on service delivery.' },
  { order: 5, question: 'What is the OTP for?',                             answer: 'The 4-digit OTP is shared with your technician when they arrive to verify job start. This ensures only your assigned technician begins the work.' },
  { order: 6, question: 'How do AMC plans work?',                           answer: 'An Annual Maintenance Contract (AMC) covers periodic free services and discounts for 6 or 12 months. After subscribing, benefits apply immediately.' },
  { order: 7, question: 'Can I track my technician in real-time?',          answer: 'Yes. Once your booking is confirmed, tap Live Tracking on the booking details screen to see your technician\'s location and ETA.' },
  { order: 8, question: 'What if I am not satisfied with the service?',     answer: 'Raise a complaint ticket from Help & Support. Our team responds within 2 hours and arranges a re-visit if required at no extra charge.' },
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing seed data
    await Promise.all([
      AMCPlan.deleteMany({}),
      Service.deleteMany({}),
      Coupon.deleteMany({}),
      FAQ.deleteMany({}),
    ]);

    await Promise.all([
      AMCPlan.insertMany(amcPlans),
      Service.insertMany(services),
      Coupon.insertMany(coupons),
      FAQ.insertMany(faqs),
    ]);

    console.log('✅ Database seeded successfully');
    console.log(`   AMC Plans : ${amcPlans.length}`);
    console.log(`   Services  : ${services.length}`);
    console.log(`   Coupons   : ${coupons.length}`);
    console.log(`   FAQs      : ${faqs.length}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
