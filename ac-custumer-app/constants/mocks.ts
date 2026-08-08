export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  basePrice: number;
  image?: string;
}

export interface Technician {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  avatar: string;
  specialty: string;
  phone: string;
}

export interface Booking {
  id: string;
  categoryTitle: string;
  technicianName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';
  price: number;
  address: string;
  description?: string;
  techAvatar?: string;
  isEmergency?: boolean;
}

export interface Coupon {
  code: string;
  discount: number;
  description: string;
  expiry: string;
}

export const CATEGORIES: Category[] = [
  { id: '1', title: 'AC Service', icon: 'Wrench', description: 'Complete filter cleaning, pressure check, and performance test.', basePrice: 49 },
  { id: '2', title: 'AC Repair', icon: 'Settings', description: 'Diagnose and fix cooling issues, noises, and electrical faults.', basePrice: 79 },
  { id: '3', title: 'AC Installation', icon: 'PlusCircle', description: 'Professional indoor and outdoor unit mounting & setup.', basePrice: 149 },
  { id: '4', title: 'AC Uninstallation', icon: 'MinusCircle', description: 'Safe removal and gas trapping of your existing air conditioner.', basePrice: 69 },
  { id: '5', title: 'Gas Charging', icon: 'Gauge', description: 'Refrigerant leak detection, repair, and full gas top-up (R32/R410).', basePrice: 99 },
  { id: '6', title: 'Jet Cleaning', icon: 'Wind', description: 'Deep high-pressure water jet cleaning for maximum efficiency.', basePrice: 59 },
  { id: '7', title: 'PCB Repair', icon: 'Cpu', description: 'Fix main logic board controller and sensor circuits.', basePrice: 119 },
  { id: '8', title: 'Water Leakage', icon: 'Droplets', description: 'Unclog drain pipe and solve condensation leakage problems.', basePrice: 39 },
  { id: '9', title: 'Compressor Repair', icon: 'Activity', description: 'Compressor diagnostics, valve replacement or new installation.', basePrice: 199 }
];

export const TECHNICIANS: Technician[] = [
  { id: '1', name: 'Alex Johnson', rating: 4.9, completedJobs: 1240, specialty: 'Master HVAC Technician', avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150', phone: '+1 555-0199' },
  { id: '2', name: 'Marcus Chen', rating: 4.8, completedJobs: 890, specialty: 'Cooling & Gas Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', phone: '+1 555-0188' },
  { id: '3', name: 'David Smith', rating: 4.7, completedJobs: 650, specialty: 'Installation expert', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', phone: '+1 555-0177' }
];

export const OFFERS = [
  {
    id: '1',
    title: 'Summer Special',
    subtitle: 'Get 20% off all AC services',
    code: 'SUMMER20',
    discount: 20,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: '2',
    title: 'Free Jet Upgrade',
    subtitle: 'Book installation, get free Jet wash',
    code: 'FREEJET',
    discount: 15,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: '3',
    title: 'First Booking',
    subtitle: 'Flat $30 off your first service request',
    code: 'WELCOME30',
    discount: 30,
    image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=80'
  }
];

export const AMC_PLANS = [
  { id: '1', name: 'Basic Shield', price: 99, duration: '1 Year', description: 'Includes 2 routine services, 10% discount on spare parts, and priority service scheduling.' },
  { id: '2', name: 'Gold Care', price: 179, duration: '1 Year', description: 'Includes 4 routine services, free repair labor, 15% discount on parts & gas top-ups.' },
  { id: '3', name: 'Premium Platinum', price: 299, duration: '2 Years', description: 'Unlimited repair calls, 4 deep jet cleanings, free gas refills & parts replacement warranty.' }
];

export const NOTIFICATIONS = [
  { id: '1', title: 'Technician Assigned', message: 'Alex Johnson has been assigned to your AC repair request.', type: 'booking', time: '10 mins ago', read: false },
  { id: '2', title: 'Summer Heat Deal!', message: 'Use code HEATWAVE for 25% off all Gas Charging services.', type: 'offer', time: '2 hours ago', read: false },
  { id: '3', title: 'Invoice Generated', message: 'Invoice for your recent AC Installation is ready for download.', type: 'payment', time: '1 day ago', read: true }
];

export const FAQS = [
  { question: 'How often should I service my AC?', answer: 'It is recommended to service your air conditioner at least twice a year—once before summer starts and once after the peak cooling season ends.' },
  { question: 'What is covered under the AMC Plan?', answer: 'Our annual maintenance plans cover routine wet/dry servicing, priority scheduling, and discounts on parts and gas charging depending on the plan type chosen.' },
  { question: 'Do you offer a warranty on repairs?', answer: 'Yes! We offer a standard 30-day service warranty on all repair tasks and a 90-day warranty on newly installed spare parts.' }
];

export const SAVED_ADDRESSES = [
  { id: 'addr_1', label: 'Home', address: '124 Ocean Drive, Apt 4B, Miami, FL' },
  { id: 'addr_2', label: 'Office', address: 'Suite 900, 500 Brickell Avenue, Miami, FL' }
];
