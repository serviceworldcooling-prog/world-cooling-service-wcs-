// ─── Types ───────────────────────────────────────────────────────────────────

export type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'In Progress';
export type TechnicianStatus = 'Available' | 'On Job' | 'Off Duty';
export type CustomerStatus = 'Active' | 'Inactive';
export type PlanStatus = 'Active' | 'Expired' | 'Pending';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  technicianId: string;
  technicianName: string;
  technicianAvatar: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  address: string;
  description: string;
  paymentMethod: string;
  invoiceId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: CustomerStatus;
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
  hasMembership: boolean;
  walletBalance: number;
  addresses: string[];
  city: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialty: string;
  rating: number;
  completedJobs: number;
  status: TechnicianStatus;
  joinDate: string;
  earnings: number;
  city: string;
  certifications: string[];
  activeBookingId?: string;
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  description: string;
  basePrice: number;
  duration: string;
  category: string;
  bookingsCount: number;
  isActive: boolean;
}

export interface AmcPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  subscribersCount: number;
  isActive: boolean;
  color: string;
}

export interface Offer {
  id: string;
  title: string;
  code: string;
  discount: number;
  discountType: 'percent' | 'flat';
  description: string;
  expiry: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
  minOrderValue: number;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  technicianId: string;
  technicianName: string;
  bookingId: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  isPublished: boolean;
  reply?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'offer' | 'payment' | 'system' | 'emergency';
  targetAudience: 'all' | 'customers' | 'technicians';
  sentAt: string;
  sentCount: number;
  readCount: number;
  status: 'sent' | 'scheduled' | 'draft';
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  date: string;
  bookingId?: string;
  method: string;
  status: 'success' | 'pending' | 'failed';
}

export interface DashboardStats {
  totalBookings: number;
  bookingsGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  activeTechnicians: number;
  techniciansGrowth: number;
  pendingBookings: number;
  completedToday: number;
  cancelRate: number;
  avgRating: number;
}

// ─── New Types ────────────────────────────────────────────────────────────────

export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Complaint {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  bookingId?: string;
  technicianName?: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  category: string;
  date: string;
  resolvedDate?: string;
  adminNote?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerAvatar: string;
  referredName: string;
  referredEmail: string;
  referralCode: string;
  status: 'Pending' | 'Completed' | 'Expired';
  date: string;
  rewardAmount: number;
  rewardPaid: boolean;
  bookingId?: string;
}

export interface Reward {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  totalPoints: number;
  usedPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  lastActivity: string;
  pointsExpiry: string;
  redemptions: number;
}

export interface Warranty {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  bookingId: string;
  service: string;
  technicianName: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Claimed';
  notes: string;
  claimDate?: string;
  claimReason?: string;
}

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  customerPhone: string;
  serviceType: string;
  description: string;
  location: string;
  requestDate: string;
  status: 'Pending' | 'Quoted' | 'Accepted' | 'Rejected';
  quotedAmount?: number;
  assignedTechnician?: string;
  notes?: string;
  isCommercial: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const MOCK_STATS: DashboardStats = {
  totalBookings: 1284,
  bookingsGrowth: 12.5,
  totalRevenue: 98420,
  revenueGrowth: 18.2,
  totalCustomers: 3847,
  customersGrowth: 8.7,
  activeTechnicians: 24,
  techniciansGrowth: 4.1,
  pendingBookings: 38,
  completedToday: 17,
  cancelRate: 6.3,
  avgRating: 4.8,
};

export const MOCK_REVENUE_CHART = [
  { month: 'Jan', revenue: 5200, bookings: 82 },
  { month: 'Feb', revenue: 6100, bookings: 95 },
  { month: 'Mar', revenue: 7400, bookings: 114 },
  { month: 'Apr', revenue: 8200, bookings: 128 },
  { month: 'May', revenue: 9800, bookings: 151 },
  { month: 'Jun', revenue: 11200, bookings: 174 },
  { month: 'Jul', revenue: 10600, bookings: 165 },
  { month: 'Aug', revenue: 12400, bookings: 192 },
  { month: 'Sep', revenue: 11800, bookings: 183 },
  { month: 'Oct', revenue: 13200, bookings: 205 },
  { month: 'Nov', revenue: 12100, bookings: 188 },
  { month: 'Dec', revenue: 15400, bookings: 240 },
];

export const MOCK_SERVICE_DISTRIBUTION = [
  { name: 'AC Service',       value: 28, color: '#0F766E' },
  { name: 'AC Repair',        value: 22, color: '#14B8A6' },
  { name: 'Gas Charging',     value: 16, color: '#F97316' },
  { name: 'AC Installation',  value: 14, color: '#8B5CF6' },
  { name: 'Jet Cleaning',     value: 10, color: '#06B6D4' },
  { name: 'Others',           value: 10, color: '#94A3B8' },
];

export const MOCK_WEEKLY_BOOKINGS = [
  { day: 'Mon', bookings: 18 },
  { day: 'Tue', bookings: 24 },
  { day: 'Wed', bookings: 21 },
  { day: 'Thu', bookings: 29 },
  { day: 'Fri', bookings: 35 },
  { day: 'Sat', bookings: 42 },
  { day: 'Sun', bookings: 31 },
];

export const MOCK_BOOKINGS: Booking[] = [
  { id: 'B001', customerId: 'C001', customerName: 'James Wilson', customerPhone: '+1 555-0101', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', technicianId: 'T001', technicianName: 'Alex Johnson', technicianAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=80', service: 'AC Repair', date: '2026-07-20', time: '10:00 AM', status: 'Upcoming', price: 99, address: '124 Ocean Drive, Apt 4B, Miami, FL', description: 'Cooling is very low, making clicking noises.', paymentMethod: 'Card', invoiceId: 'INV-001' },
  { id: 'B002', customerId: 'C002', customerName: 'Sophia Martinez', customerPhone: '+1 555-0102', customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=80', technicianId: 'T002', technicianName: 'Marcus Chen', technicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', service: 'AC Service', date: '2026-07-18', time: '02:00 PM', status: 'Completed', price: 49, address: 'Suite 900, 500 Brickell Ave, Miami, FL', description: 'Routine service check.', paymentMethod: 'UPI', invoiceId: 'INV-002' },
  { id: 'B003', customerId: 'C003', customerName: 'Ethan Brown', customerPhone: '+1 555-0103', customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', technicianId: 'T003', technicianName: 'David Smith', technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', service: 'Gas Charging', date: '2026-07-18', time: '11:30 AM', status: 'In Progress', price: 99, address: '780 NW 42nd Ave, Miami, FL', description: 'Gas refill and leak check R410A.', paymentMethod: 'Wallet', invoiceId: 'INV-003' },
  { id: 'B004', customerId: 'C004', customerName: 'Olivia Davis', customerPhone: '+1 555-0104', customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', technicianId: 'T001', technicianName: 'Alex Johnson', technicianAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=80', service: 'AC Installation', date: '2026-07-17', time: '09:00 AM', status: 'Completed', price: 149, address: '2200 Collins Ave, Miami Beach, FL', description: 'New split AC 1.5 ton installation.', paymentMethod: 'Card', invoiceId: 'INV-004' },
  { id: 'B005', customerId: 'C005', customerName: 'Noah Garcia', customerPhone: '+1 555-0105', customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80', technicianId: 'T002', technicianName: 'Marcus Chen', technicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', service: 'Jet Cleaning', date: '2026-07-16', time: '03:00 PM', status: 'Cancelled', price: 59, address: '100 Miracle Mile, Coral Gables, FL', description: 'Deep jet cleaning requested.', paymentMethod: 'UPI', invoiceId: 'INV-005' },
  { id: 'B006', customerId: 'C006', customerName: 'Emma Thompson', customerPhone: '+1 555-0106', customerAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', technicianId: 'T003', technicianName: 'David Smith', technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', service: 'Water Leakage', date: '2026-07-21', time: '10:30 AM', status: 'Upcoming', price: 39, address: '3301 SW 27th Ave, Miami, FL', description: 'Water dripping from indoor unit.', paymentMethod: 'Card', invoiceId: 'INV-006' },
  { id: 'B007', customerId: 'C001', customerName: 'James Wilson', customerPhone: '+1 555-0101', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', technicianId: 'T001', technicianName: 'Alex Johnson', technicianAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=80', service: 'PCB Repair', date: '2026-07-15', time: '01:00 PM', status: 'Completed', price: 119, address: '124 Ocean Drive, Apt 4B, Miami, FL', description: 'Main board not responding.', paymentMethod: 'Card', invoiceId: 'INV-007' },
  { id: 'B008', customerId: 'C007', customerName: 'Liam Anderson', customerPhone: '+1 555-0107', customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', technicianId: 'T002', technicianName: 'Marcus Chen', technicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', service: 'Compressor Repair', date: '2026-07-22', time: '08:00 AM', status: 'Upcoming', price: 199, address: '1900 Biscayne Blvd, Miami, FL', description: 'Compressor making grinding sound.', paymentMethod: 'Card', invoiceId: 'INV-008' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C001', name: 'James Wilson', email: 'james.wilson@email.com', phone: '+1 555-0101', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', status: 'Active', joinDate: '2025-03-12', totalBookings: 7, totalSpent: 642, hasMembership: true, walletBalance: 45, addresses: ['124 Ocean Drive, Apt 4B, Miami, FL'], city: 'Miami' },
  { id: 'C002', name: 'Sophia Martinez', email: 'sophia.m@email.com', phone: '+1 555-0102', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=80', status: 'Active', joinDate: '2025-05-08', totalBookings: 4, totalSpent: 278, hasMembership: false, walletBalance: 120, addresses: ['Suite 900, 500 Brickell Ave, Miami, FL'], city: 'Miami' },
  { id: 'C003', name: 'Ethan Brown', email: 'ethan.b@email.com', phone: '+1 555-0103', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', status: 'Active', joinDate: '2025-01-20', totalBookings: 12, totalSpent: 1140, hasMembership: true, walletBalance: 200, addresses: ['780 NW 42nd Ave, Miami, FL'], city: 'Miami' },
  { id: 'C004', name: 'Olivia Davis', email: 'olivia.d@email.com', phone: '+1 555-0104', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', status: 'Active', joinDate: '2025-06-15', totalBookings: 3, totalSpent: 298, hasMembership: false, walletBalance: 0, addresses: ['2200 Collins Ave, Miami Beach, FL'], city: 'Miami Beach' },
  { id: 'C005', name: 'Noah Garcia', email: 'noah.g@email.com', phone: '+1 555-0105', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80', status: 'Inactive', joinDate: '2025-02-28', totalBookings: 2, totalSpent: 108, hasMembership: false, walletBalance: 10, addresses: ['100 Miracle Mile, Coral Gables, FL'], city: 'Coral Gables' },
  { id: 'C006', name: 'Emma Thompson', email: 'emma.t@email.com', phone: '+1 555-0106', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', status: 'Active', joinDate: '2026-01-10', totalBookings: 5, totalSpent: 392, hasMembership: true, walletBalance: 75, addresses: ['3301 SW 27th Ave, Miami, FL'], city: 'Miami' },
  { id: 'C007', name: 'Liam Anderson', email: 'liam.a@email.com', phone: '+1 555-0107', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', status: 'Active', joinDate: '2025-09-05', totalBookings: 9, totalSpent: 876, hasMembership: true, walletBalance: 150, addresses: ['1900 Biscayne Blvd, Miami, FL'], city: 'Miami' },
  { id: 'C008', name: 'Ava Robinson', email: 'ava.r@email.com', phone: '+1 555-0108', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80', status: 'Inactive', joinDate: '2025-04-18', totalBookings: 1, totalSpent: 49, hasMembership: false, walletBalance: 0, addresses: ['5555 SW 8th St, Miami, FL'], city: 'Miami' },
];

export const MOCK_TECHNICIANS: Technician[] = [
  { id: 'T001', name: 'Alex Johnson', email: 'alex.j@acservice.com', phone: '+1 555-0199', avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=80', specialty: 'Master HVAC Technician', rating: 4.9, completedJobs: 1240, status: 'On Job', joinDate: '2024-01-15', earnings: 48200, city: 'Miami', certifications: ['EPA 608', 'NATE Certified', 'HVAC Excellence'], activeBookingId: 'B001' },
  { id: 'T002', name: 'Marcus Chen', email: 'marcus.c@acservice.com', phone: '+1 555-0188', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', specialty: 'Cooling & Gas Specialist', rating: 4.8, completedJobs: 890, status: 'Available', joinDate: '2024-03-10', earnings: 36700, city: 'Miami', certifications: ['EPA 608', 'R410A Certified'] },
  { id: 'T003', name: 'David Smith', email: 'david.s@acservice.com', phone: '+1 555-0177', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', specialty: 'Installation Expert', rating: 4.7, completedJobs: 650, status: 'Available', joinDate: '2024-06-20', earnings: 27400, city: 'Miami Beach', certifications: ['EPA 608', 'NATE Certified'] },
  { id: 'T004', name: 'Carlos Rivera', email: 'carlos.r@acservice.com', phone: '+1 555-0166', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80', specialty: 'PCB & Electrical Specialist', rating: 4.6, completedJobs: 420, status: 'Off Duty', joinDate: '2025-01-08', earnings: 18900, city: 'Coral Gables', certifications: ['EPA 608', 'Electronics Certification'] },
  { id: 'T005', name: 'Ryan Patel', email: 'ryan.p@acservice.com', phone: '+1 555-0155', avatar: 'https://images.unsplash.com/photo-1561406636-b80293969660?w=80', specialty: 'Multi-Brand Specialist', rating: 4.9, completedJobs: 780, status: 'On Job', joinDate: '2024-08-14', earnings: 33100, city: 'Miami', certifications: ['EPA 608', 'NATE Certified', 'Daikin Certified'], activeBookingId: 'B003' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 'S001', title: 'AC Service', icon: 'Wrench', description: 'Complete filter cleaning, pressure check, and performance test.', basePrice: 49, duration: '1-2 hrs', category: 'Maintenance', bookingsCount: 358, isActive: true },
  { id: 'S002', title: 'AC Repair', icon: 'Settings', description: 'Diagnose and fix cooling issues, noises, and electrical faults.', basePrice: 79, duration: '2-3 hrs', category: 'Repair', bookingsCount: 282, isActive: true },
  { id: 'S003', title: 'AC Installation', icon: 'PlusCircle', description: 'Professional indoor and outdoor unit mounting & setup.', basePrice: 149, duration: '3-5 hrs', category: 'Installation', bookingsCount: 180, isActive: true },
  { id: 'S004', title: 'AC Uninstallation', icon: 'MinusCircle', description: 'Safe removal and gas trapping of your existing air conditioner.', basePrice: 69, duration: '1-2 hrs', category: 'Installation', bookingsCount: 94, isActive: true },
  { id: 'S005', title: 'Gas Charging', icon: 'Gauge', description: 'Refrigerant leak detection, repair, and full gas top-up (R32/R410).', basePrice: 99, duration: '1-3 hrs', category: 'Repair', bookingsCount: 205, isActive: true },
  { id: 'S006', title: 'Jet Cleaning', icon: 'Wind', description: 'Deep high-pressure water jet cleaning for maximum efficiency.', basePrice: 59, duration: '1-2 hrs', category: 'Maintenance', bookingsCount: 128, isActive: true },
  { id: 'S007', title: 'PCB Repair', icon: 'Cpu', description: 'Fix main logic board controller and sensor circuits.', basePrice: 119, duration: '2-4 hrs', category: 'Repair', bookingsCount: 72, isActive: true },
  { id: 'S008', title: 'Water Leakage', icon: 'Droplets', description: 'Unclog drain pipe and solve condensation leakage problems.', basePrice: 39, duration: '1-2 hrs', category: 'Repair', bookingsCount: 145, isActive: true },
  { id: 'S009', title: 'Compressor Repair', icon: 'Activity', description: 'Compressor diagnostics, valve replacement or new installation.', basePrice: 199, duration: '3-6 hrs', category: 'Repair', bookingsCount: 58, isActive: false },
];

export const MOCK_AMC_PLANS: AmcPlan[] = [
  { id: 'P001', name: 'Basic Shield', price: 99, duration: '1 Year', features: ['2 routine services', '10% discount on spare parts', 'Priority scheduling', 'Phone support'], subscribersCount: 284, isActive: true, color: '#14B8A6' },
  { id: 'P002', name: 'Gold Care', price: 179, duration: '1 Year', features: ['4 routine services', 'Free repair labor', '15% discount on parts & gas', '24/7 phone support', 'Emergency call within 4 hrs'], subscribersCount: 196, isActive: true, color: '#F97316' },
  { id: 'P003', name: 'Premium Platinum', price: 299, duration: '2 Years', features: ['Unlimited repair calls', '4 deep jet cleanings', 'Free gas refills', 'Parts replacement warranty', 'Dedicated account manager', 'Same-day emergency service'], subscribersCount: 112, isActive: true, color: '#8B5CF6' },
];

export const MOCK_OFFERS: Offer[] = [
  { id: 'O001', title: 'Summer Special', code: 'SUMMER20', discount: 20, discountType: 'percent', description: 'Get 20% off all AC services this summer', expiry: '2026-08-31', usageCount: 142, maxUsage: 500, isActive: true, minOrderValue: 0 },
  { id: 'O002', title: 'Free Jet Upgrade', code: 'FREEJET', discount: 15, discountType: 'percent', description: 'Book installation, get free Jet wash', expiry: '2026-09-15', usageCount: 89, maxUsage: 200, isActive: true, minOrderValue: 149 },
  { id: 'O003', title: 'Welcome Offer', code: 'WELCOME30', discount: 30, discountType: 'flat', description: 'Flat $30 off your first service request', expiry: '2026-12-31', usageCount: 312, maxUsage: 1000, isActive: true, minOrderValue: 50 },
  { id: 'O004', title: 'Heatwave Deal', code: 'HEATWAVE25', discount: 25, discountType: 'percent', description: '25% off on Gas Charging services', expiry: '2026-07-31', usageCount: 198, maxUsage: 300, isActive: false, minOrderValue: 0 },
  { id: 'O005', title: 'Referral Bonus', code: 'REFER50', discount: 50, discountType: 'flat', description: 'Refer a friend and both get $50 off', expiry: '2026-12-31', usageCount: 67, maxUsage: 500, isActive: true, minOrderValue: 79 },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'R001', customerId: 'C002', customerName: 'Sophia Martinez', customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=80', technicianId: 'T002', technicianName: 'Marcus Chen', bookingId: 'B002', service: 'AC Service', rating: 5, comment: 'Excellent service! Marcus was very professional and thorough. My AC is cooling much better now.', date: '2026-07-18', isPublished: true, reply: 'Thank you Sophia! We are glad you are happy with the service.' },
  { id: 'R002', customerId: 'C004', customerName: 'Olivia Davis', customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', technicianId: 'T001', technicianName: 'Alex Johnson', bookingId: 'B004', service: 'AC Installation', rating: 5, comment: 'Alex did an amazing job with the installation. Very clean work, no mess left behind!', date: '2026-07-17', isPublished: true },
  { id: 'R003', customerId: 'C001', customerName: 'James Wilson', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', technicianId: 'T001', technicianName: 'Alex Johnson', bookingId: 'B007', service: 'PCB Repair', rating: 4, comment: 'Good work overall, took a bit longer than expected but the result is great.', date: '2026-07-15', isPublished: true },
  { id: 'R004', customerId: 'C007', customerName: 'Liam Anderson', customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', technicianId: 'T003', technicianName: 'David Smith', bookingId: 'B007', service: 'AC Repair', rating: 3, comment: 'Service was okay, but the technician arrived 30 minutes late. Issue got fixed though.', date: '2026-07-14', isPublished: false },
  { id: 'R005', customerId: 'C006', customerName: 'Emma Thompson', customerAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', technicianId: 'T005', technicianName: 'Ryan Patel', bookingId: 'B006', service: 'Gas Charging', rating: 5, comment: 'Ryan is phenomenal! Diagnosed the leak quickly and had it fixed in no time. Highly recommend!', date: '2026-07-13', isPublished: true },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'N001', title: 'Summer Maintenance Reminder', body: 'Hi! Summer is here. Schedule your AC service now and enjoy 20% off with code SUMMER20.', type: 'offer', targetAudience: 'customers', sentAt: '2026-07-15 10:00 AM', sentCount: 3847, readCount: 1923, status: 'sent' },
  { id: 'N002', title: 'New Booking Alert', body: 'You have been assigned a new AC Repair booking (B001) at 124 Ocean Drive, Miami.', type: 'booking', targetAudience: 'technicians', sentAt: '2026-07-18 09:30 AM', sentCount: 1, readCount: 1, status: 'sent' },
  { id: 'N003', title: 'Payment Received', body: 'Your payment of $149 for AC Installation (INV-004) has been received. Thank you!', type: 'payment', targetAudience: 'customers', sentAt: '2026-07-17 06:00 PM', sentCount: 1, readCount: 1, status: 'sent' },
  { id: 'N004', title: 'Upcoming Service Reminder', body: 'Your AC service is scheduled for tomorrow at 10:00 AM. Our technician will arrive on time.', type: 'booking', targetAudience: 'customers', sentAt: '2026-07-20 08:00 AM', sentCount: 12, readCount: 0, status: 'scheduled' },
  { id: 'N005', title: 'System Maintenance Alert', body: 'The app will undergo maintenance on July 25, 2026 from 2:00 AM – 4:00 AM.', type: 'system', targetAudience: 'all', sentAt: '', sentCount: 0, readCount: 0, status: 'draft' },
  { id: 'N006', title: 'Emergency Service Available', body: 'We now offer 24/7 emergency AC repair service. Book anytime, anywhere!', type: 'emergency', targetAudience: 'customers', sentAt: '2026-07-10 12:00 PM', sentCount: 3847, readCount: 2198, status: 'sent' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN001', customerId: 'C004', customerName: 'Olivia Davis', customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', type: 'credit', amount: 149, description: 'Payment for AC Installation (INV-004)', date: '2026-07-17', bookingId: 'B004', method: 'Credit Card', status: 'success' },
  { id: 'TXN002', customerId: 'C002', customerName: 'Sophia Martinez', customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=80', type: 'credit', amount: 49, description: 'Payment for AC Service (INV-002)', date: '2026-07-18', bookingId: 'B002', method: 'UPI', status: 'success' },
  { id: 'TXN003', customerId: 'C005', customerName: 'Noah Garcia', customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80', type: 'refund', amount: 59, description: 'Refund for cancelled booking (B005)', date: '2026-07-16', bookingId: 'B005', method: 'UPI', status: 'success' },
  { id: 'TXN004', customerId: 'C003', customerName: 'Ethan Brown', customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', type: 'credit', amount: 179, description: 'AMC Gold Care Plan subscription', date: '2026-07-14', method: 'Credit Card', status: 'success' },
  { id: 'TXN005', customerId: 'C001', customerName: 'James Wilson', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', type: 'debit', amount: 45, description: 'Wallet top-up deduction — service discount applied', date: '2026-07-15', bookingId: 'B007', method: 'Wallet', status: 'success' },
  { id: 'TXN006', customerId: 'C006', customerName: 'Emma Thompson', customerAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', type: 'credit', amount: 299, description: 'Premium Platinum AMC Plan (2 Years)', date: '2026-07-12', method: 'Credit Card', status: 'success' },
  { id: 'TXN007', customerId: 'C007', customerName: 'Liam Anderson', customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', type: 'credit', amount: 199, description: 'Payment for Compressor Repair (INV-008)', date: '2026-07-19', bookingId: 'B008', method: 'Credit Card', status: 'pending' },
];

// ─── New Mock Data ────────────────────────────────────────────────────────────

export const MOCK_COMPLAINTS: Complaint[] = [
  { id: 'CMP001', customerId: 'C001', customerName: 'James Wilson', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', bookingId: 'B001', technicianName: 'Alex Johnson', subject: 'AC still not cooling after repair', description: 'I had AC Repair done yesterday but the unit is still not cooling properly. The technician said it was fixed but the problem persists.', status: 'Open', priority: 'High', category: 'Service Quality', date: '2026-07-19', adminNote: '' },
  { id: 'CMP002', customerId: 'C005', customerName: 'Noah Garcia', customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80', bookingId: 'B005', technicianName: 'Marcus Chen', subject: 'Technician arrived 2 hours late', description: 'The scheduled time was 3:00 PM but technician arrived at 5:15 PM. No prior notification was given and the booking was eventually cancelled.', status: 'In Progress', priority: 'Medium', category: 'Punctuality', date: '2026-07-16', adminNote: 'Contacted technician. Investigating delay cause.' },
  { id: 'CMP003', customerId: 'C007', customerName: 'Liam Anderson', customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', subject: 'Overcharged for service', description: 'I was quoted $149 for AC Installation but was charged $199 at the end. No explanation was provided for the extra $50 charge.', status: 'Resolved', priority: 'Urgent', category: 'Billing', date: '2026-07-14', resolvedDate: '2026-07-16', adminNote: 'Refund of $50 processed.' },
  { id: 'CMP004', customerId: 'C003', customerName: 'Ethan Brown', customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', bookingId: 'B003', technicianName: 'David Smith', subject: 'Gas leak found after charging', description: 'After gas charging service, I noticed a small leak from the connection point. The technician may not have sealed it properly.', status: 'Open', priority: 'Urgent', category: 'Safety', date: '2026-07-18', adminNote: '' },
  { id: 'CMP005', customerId: 'C006', customerName: 'Emma Thompson', customerAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', subject: 'App not showing booking status', description: 'My booking B006 shows as Upcoming in the app but I received no technician details. The booking date is tomorrow.', status: 'Closed', priority: 'Low', category: 'App Issue', date: '2026-07-20', resolvedDate: '2026-07-20', adminNote: 'App sync issue resolved. Customer notified.' },
];

export const MOCK_REFERRALS: Referral[] = [
  { id: 'REF001', referrerId: 'C001', referrerName: 'James Wilson', referrerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', referredName: 'Michael Scott', referredEmail: 'michael.s@email.com', referralCode: 'JAMES50', status: 'Completed', date: '2026-07-10', rewardAmount: 50, rewardPaid: true, bookingId: 'B009' },
  { id: 'REF002', referrerId: 'C003', referrerName: 'Ethan Brown', referrerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', referredName: 'Sarah Connor', referredEmail: 'sarah.c@email.com', referralCode: 'ETHAN50', status: 'Pending', date: '2026-07-17', rewardAmount: 50, rewardPaid: false },
  { id: 'REF003', referrerId: 'C006', referrerName: 'Emma Thompson', referrerAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', referredName: 'Tony Stark', referredEmail: 'tony.s@email.com', referralCode: 'EMMA50', status: 'Completed', date: '2026-07-05', rewardAmount: 50, rewardPaid: true, bookingId: 'B010' },
  { id: 'REF004', referrerId: 'C007', referrerName: 'Liam Anderson', referrerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', referredName: 'Bruce Wayne', referredEmail: 'bruce.w@email.com', referralCode: 'LIAM50', status: 'Expired', date: '2026-06-15', rewardAmount: 50, rewardPaid: false },
  { id: 'REF005', referrerId: 'C002', referrerName: 'Sophia Martinez', referrerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=80', referredName: 'Diana Prince', referredEmail: 'diana.p@email.com', referralCode: 'SOPHIA50', status: 'Completed', date: '2026-07-12', rewardAmount: 50, rewardPaid: true, bookingId: 'B011' },
];

export const MOCK_REWARDS: Reward[] = [
  { id: 'RWD001', customerId: 'C001', customerName: 'James Wilson', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', totalPoints: 2850, usedPoints: 400, tier: 'Gold', lastActivity: '2026-07-18', pointsExpiry: '2027-03-12', redemptions: 3 },
  { id: 'RWD002', customerId: 'C003', customerName: 'Ethan Brown', customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', totalPoints: 5200, usedPoints: 1000, tier: 'Platinum', lastActivity: '2026-07-16', pointsExpiry: '2027-01-20', redemptions: 8 },
  { id: 'RWD003', customerId: 'C006', customerName: 'Emma Thompson', customerAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', totalPoints: 1650, usedPoints: 200, tier: 'Silver', lastActivity: '2026-07-15', pointsExpiry: '2027-01-10', redemptions: 2 },
  { id: 'RWD004', customerId: 'C007', customerName: 'Liam Anderson', customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', totalPoints: 3900, usedPoints: 750, tier: 'Gold', lastActivity: '2026-07-19', pointsExpiry: '2027-09-05', redemptions: 5 },
  { id: 'RWD005', customerId: 'C002', customerName: 'Sophia Martinez', customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=80', totalPoints: 980, usedPoints: 0, tier: 'Bronze', lastActivity: '2026-07-08', pointsExpiry: '2027-05-08', redemptions: 0 },
  { id: 'RWD006', customerId: 'C004', customerName: 'Olivia Davis', customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', totalPoints: 720, usedPoints: 100, tier: 'Bronze', lastActivity: '2026-07-17', pointsExpiry: '2027-06-15', redemptions: 1 },
];

export const MOCK_WARRANTIES: Warranty[] = [
  { id: 'WRT001', customerId: 'C004', customerName: 'Olivia Davis', customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', bookingId: 'B004', service: 'AC Installation', technicianName: 'Alex Johnson', startDate: '2026-07-17', endDate: '2027-07-17', status: 'Active', notes: '1-year installation warranty on parts and labor.' },
  { id: 'WRT002', customerId: 'C001', customerName: 'James Wilson', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', bookingId: 'B007', service: 'PCB Repair', technicianName: 'Alex Johnson', startDate: '2026-07-15', endDate: '2027-01-15', status: 'Active', notes: '6-month warranty on PCB repair.' },
  { id: 'WRT003', customerId: 'C003', customerName: 'Ethan Brown', customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', bookingId: 'B003', service: 'Gas Charging', technicianName: 'David Smith', startDate: '2026-04-10', endDate: '2026-07-10', status: 'Expired', notes: '3-month warranty on gas charging service.' },
  { id: 'WRT004', customerId: 'C007', customerName: 'Liam Anderson', customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', bookingId: 'B008', service: 'Compressor Repair', technicianName: 'Marcus Chen', startDate: '2026-07-22', endDate: '2027-07-22', status: 'Active', notes: '1-year warranty on compressor repair.', claimDate: undefined },
  { id: 'WRT005', customerId: 'C006', customerName: 'Emma Thompson', customerAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', bookingId: 'B006', service: 'Water Leakage', technicianName: 'David Smith', startDate: '2026-07-21', endDate: '2026-10-21', status: 'Claimed', notes: '3-month warranty.', claimDate: '2026-07-25', claimReason: 'Leak reappeared at same location.' },
];

export const MOCK_QUOTES: Quote[] = [
  { id: 'QT001', customerId: 'C001', customerName: 'James Wilson', customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80', customerPhone: '+1 555-0101', serviceType: 'Commercial HVAC Installation', description: 'Need central AC system installed for a 2000 sq ft office space. Looking for split system or ducted options.', location: 'Downtown Miami Office Tower, FL', requestDate: '2026-07-18', status: 'Pending', isCommercial: true },
  { id: 'QT002', customerId: 'C007', customerName: 'Liam Anderson', customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80', customerPhone: '+1 555-0107', serviceType: 'Multi-Unit AC Service Contract', description: 'Annual maintenance contract for 8 apartments in a residential complex. Need quarterly servicing schedule.', location: '1900 Biscayne Blvd, Miami, FL', requestDate: '2026-07-16', status: 'Quoted', quotedAmount: 1200, assignedTechnician: 'Marcus Chen', notes: 'Quote includes 4 visits/year per unit.', isCommercial: true },
  { id: 'QT003', customerId: 'C003', customerName: 'Ethan Brown', customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80', customerPhone: '+1 555-0103', serviceType: 'Emergency Repair - Restaurant', description: 'Restaurant AC completely down during peak summer. Need emergency repair ASAP for kitchen unit.', location: '780 NW 42nd Ave, Miami, FL', requestDate: '2026-07-19', status: 'Accepted', quotedAmount: 450, assignedTechnician: 'Alex Johnson', notes: 'Emergency dispatch approved. Parts ordered.', isCommercial: true },
  { id: 'QT004', customerId: 'C004', customerName: 'Olivia Davis', customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80', customerPhone: '+1 555-0104', serviceType: 'AC Duct Cleaning + Sanitization', description: 'Full duct cleaning and sanitization for 5-bedroom house. Also interested in UV filter installation.', location: '2200 Collins Ave, Miami Beach, FL', requestDate: '2026-07-15', status: 'Rejected', notes: 'Service not available in requested area.', isCommercial: false },
  { id: 'QT005', customerId: 'C006', customerName: 'Emma Thompson', customerAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80', customerPhone: '+1 555-0106', serviceType: 'Smart AC Integration', description: 'Need smart home integration for existing AC units (4 units). Looking for Google Home and Alexa compatibility.', location: '3301 SW 27th Ave, Miami, FL', requestDate: '2026-07-20', status: 'Pending', isCommercial: false },
];
