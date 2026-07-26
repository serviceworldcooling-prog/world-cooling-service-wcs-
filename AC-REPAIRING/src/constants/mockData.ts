export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
}

export interface Booking {
  id: string;
  serviceName: string;
  category: string;
  date: string;
  time: string;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  technicianName?: string;
  technicianPhone?: string;
  technicianRating?: number;
  technicianAvatar?: string;
  price: number;
  discount: number;
  tax: number;
  totalPrice: number;
  address: string;
  timeline: { title: string; desc: string; time: string; done: boolean }[];
}

export const MOCK_CATEGORIES: ServiceCategory[] = [
  { id: '1', name: 'AC Wet Servicing', icon: 'air-service', description: 'Deep water jet cleaning of indoor/outdoor units', price: 599 },
  { id: '2', name: 'AC Repairing', icon: 'build', description: 'Fixing cooling issues, fan noise, water leakage', price: 399 },
  { id: '3', name: 'AC Installation', icon: 'add-circle-outline', description: 'Mounting & setup of split/window AC units', price: 1499 },
  { id: '4', name: 'Gas Charging', icon: 'opacity', description: 'Eco-friendly R32/R410 gas refill & leak detection', price: 2199 },
  { id: '5', name: 'AC Uninstallation', icon: 'remove-circle-outline', description: 'Safe removal of indoor and outdoor units', price: 699 },
  { id: '6', name: 'Comprehensive AMC', icon: 'verified-user', description: 'Yearly maintenance package with unlimited repairs', price: 3499 },
];

export const MOCK_COUPONS = [
  { id: '1', code: 'COOL50', discount: 150, description: 'Flat ₹150 off on wet servicing', minCartValue: 500 },
  { id: '2', code: 'SUMMERDRY', discount: 300, description: 'Save ₹300 on Gas Charging & Repairs', minCartValue: 1200 },
  { id: '3', code: 'FIRSTAC', discount: 200, description: '20% off on your first AC service', minCartValue: 400 },
  { id: '4', code: 'SUPERAMC', discount: 500, description: 'Flat ₹500 off on Comprehensive AMC plans', minCartValue: 3000 },
];

export const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Booking Confirmed!', body: 'Your AC Wet Servicing is scheduled for tomorrow at 10:00 AM.', time: '2 hours ago', read: false },
  { id: '2', title: 'Technician Assigned', body: 'Rahul Sharma has been assigned to your service request.', time: '5 hours ago', read: false },
  { id: '3', title: 'Summer Offer 🌟', body: 'Get up to 30% off on premium AC AMC plans. Use code AMC30.', time: '1 day ago', read: true },
  { id: '4', title: 'Payment Successful', body: 'Payment of ₹599 received for Booking #AC-90812.', time: '3 days ago', read: true },
];

export const MOCK_ADDRESSES = [
  { id: '1', label: 'Home', address: 'Flat 402, Block B, Silver Oak Residency, Sector 62, Noida, UP - 201301' },
  { id: '2', label: 'Office', address: '7th Floor, Cyber Towers, Tech Park Phase 2, Sector 135, Noida, UP - 201305' },
];

export const MOCK_FAQS = [
  { id: '1', question: 'How often should I service my AC?', answer: 'It is recommended to service your air conditioner at least twice a year (before summer starts and after the monsoon season) to ensure optimal cooling and air quality.' },
  { id: '2', question: 'What is included in AC Wet Servicing?', answer: 'AC Wet Servicing includes deep cleaning of the cooling coils, condenser coils, drain tray, outer panel, and air filters with a high-pressure water jet machine, followed by checkup of current, gas pressure, and fan motor.' },
  { id: '3', question: 'Do you offer a warranty on repairs?', answer: 'Yes! We provide a 30-day service warranty on all AC repairs and installations done through our platform. Any issue related to the service will be resolved free of cost.' },
  { id: '4', question: 'What is comprehensive AMC?', answer: 'AMC stands for Annual Maintenance Contract. The Comprehensive AMC covers 2 wet services, unlimited breakdown support, and replacement of basic electrical components (excluding compressor replacement).' },
];

export const MOCK_COMPLAINTS = [
  { id: 'COM-1082', subject: 'Water leaking after service', date: '10 July 2026', status: 'Resolved', description: 'Technician left water drop inside the room. Support sent another technician and resolved it.' },
  { id: 'COM-2098', subject: 'Cooling issue still persists', date: '14 July 2026', status: 'In Review', description: 'Gas refill was done but unit is not throwing cold air today. Need inspection.' },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'AC-1029',
    serviceName: 'AC Wet Servicing',
    category: 'Servicing',
    date: '16 July 2026',
    time: '10:00 AM - 12:00 PM',
    status: 'In Progress',
    technicianName: 'Rahul Sharma',
    technicianPhone: '+91 98765 43210',
    technicianRating: 4.8,
    technicianAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    price: 599,
    discount: 50,
    tax: 98,
    totalPrice: 647,
    address: 'Flat 402, Block B, Silver Oak Residency, Sector 62, Noida, UP - 201301',
    timeline: [
      { title: 'Booking Confirmed', desc: 'Your booking has been registered successfully', time: '09:00 AM', done: true },
      { title: 'Technician Assigned', desc: 'Rahul Sharma is on the way to your location', time: '09:45 AM', done: true },
      { title: 'Service Started', desc: 'Wet jet cleaning process in progress', time: '10:15 AM', done: true },
      { title: 'Completed & Checked', desc: 'AC cooling test and final inspection', time: '--:--', done: false },
    ]
  },
  {
    id: 'AC-0982',
    serviceName: 'Gas Charging & Leak Fix',
    category: 'Repair',
    date: '28 June 2026',
    time: '02:00 PM - 04:00 PM',
    status: 'Completed',
    technicianName: 'Amit Verma',
    technicianPhone: '+91 91234 56789',
    technicianRating: 4.9,
    technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    price: 2199,
    discount: 300,
    tax: 341,
    totalPrice: 2240,
    address: 'Flat 402, Block B, Silver Oak Residency, Sector 62, Noida, UP - 201301',
    timeline: [
      { title: 'Booking Confirmed', desc: 'Booking registered successfully', time: '01:00 PM', done: true },
      { title: 'Technician Assigned', desc: 'Amit Verma was assigned to service', time: '01:30 PM', done: true },
      { title: 'Service In Progress', desc: 'Refilled R32 Gas and patched leakage', time: '02:15 PM', done: true },
      { title: 'Completed & Checked', desc: 'Billing details sent to app', time: '03:30 PM', done: true },
    ]
  }
];
