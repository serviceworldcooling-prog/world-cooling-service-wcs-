import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getToken, clearToken } from '../api/client';
import * as authApi from '../api/authApi';
import * as jobsApi from '../api/jobsApi';
import * as notificationApi from '../api/notificationApi';
import * as complaintApi from '../api/complaintApi';
import * as profileApi from '../api/profileApi';
import type { TechnicianUser } from '../api/authApi';
import type { Job, JobStatus } from '../api/jobsApi';
import type { TechNotification } from '../api/notificationApi';
import type { TechComplaint } from '../api/complaintApi';
import { INITIAL_BOOKINGS, type Booking, MOCK_ADDRESSES } from '../constants/mockData';

// ─── Context shape ────────────────────────────────────────────────────────────
interface AppContextType {
  // Auth
  user: TechnicianUser;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Jobs
  jobs: Job[];
  jobsLoading: boolean;
  loadJobs: (status?: JobStatus) => Promise<void>;
  acceptJob: (bookingId: string) => Promise<void>;
  startJob: (bookingId: string) => Promise<void>;

  // Notifications
  notifications: TechNotification[];
  unreadCount: number;
  notifLoading: boolean;
  loadNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  // Complaints
  complaints: TechComplaint[];
  addComplaint: (subject: string, description: string, bookingId?: string) => Promise<TechComplaint>;
  loadComplaints: () => Promise<void>;

  // Bookings & profile
  bookings: Booking[];
  addBooking: (payload: {
    serviceName: string;
    category: string;
    date: string;
    time: string;
    price: number;
    discount?: number;
    tax: number;
    totalPrice: number;
    address: string;
  }) => Booking;
  addAddress: (label: string, address: string) => void;
  deleteAddress: (id: string) => void;
  updateProfile: (payload: {
    name?: string;
    phone?: string;
    avatar?: string;
    city?: string;
    membership?: 'Standard' | 'Gold' | 'Platinum';
  }) => Promise<void>;
  updateTechStatus: (status: 'Available' | 'On Job' | 'Off Duty') => Promise<void>;
}

const fallbackUser: TechnicianUser = {
  _id: 'demo-technician',
  name: 'Rahul Sharma',
  email: 'rahul@coolbreeze.com',
  phone: '9876543210',
  avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
  role: 'technician',
  specialty: 'AC Repair & AMC',
  rating: 4.8,
  completedJobs: 128,
  earnings: 24800,
  city: 'Noida',
  certifications: ['HVAC Certified', 'Gas Handling'],
  technicianStatus: 'Available',
  addresses: MOCK_ADDRESSES,
  membership: 'Gold',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [user, setUser]               = useState<TechnicianUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // true on boot while restoring
  const [authError, setAuthError]     = useState<string | null>(null);

  // ── Jobs ────────────────────────────────────────────────────────────────────
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // ── Notifications ───────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<TechNotification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [notifLoading, setNotifLoading]   = useState(false);

  // ── Complaints ──────────────────────────────────────────────────────────────
  const [complaints, setComplaints] = useState<TechComplaint[]>([]);

  // ── Bookings ───────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  // ── Restore session on app start ────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const me = await authApi.getMe();
        // Only allow technician role to log into this app
        if (me.role !== 'technician') {
          await clearToken();
          return;
        }
        setUser({
          ...fallbackUser,
          ...me,
          addresses: me.addresses ?? fallbackUser.addresses,
          membership: me.membership ?? fallbackUser.membership,
        });
      } catch {
        await clearToken();
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────────────
  const login = async (phone: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login(phone, password);
      if (res.user.role !== 'technician') {
        throw new Error('This app is for technicians only.');
      }
      setUser({
        ...fallbackUser,
        ...res.user,
        addresses: res.user.addresses ?? fallbackUser.addresses,
        membership: res.user.membership ?? fallbackUser.membership,
      });
    } catch (err: any) {
      setAuthError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setJobs([]);
    setNotifications([]);
    setUnreadCount(0);
    setComplaints([]);
  };

  // ── Jobs ────────────────────────────────────────────────────────────────────
  const loadJobs = useCallback(async (status?: JobStatus) => {
    setJobsLoading(true);
    try {
      const data = await jobsApi.getMyJobs(status);
      setJobs(data);
    } catch {
      // silently keep previous data
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const acceptJob = async (bookingId: string) => {
    const updated = await jobsApi.acceptJob(bookingId);
    setJobs(prev => prev.map(j => j._id === bookingId ? { ...j, ...updated } : j));
  };

  const startJob = async (bookingId: string) => {
    const updated = await jobsApi.startJob(bookingId);
    setJobs(prev => prev.map(j => j._id === bookingId ? { ...j, ...updated } : j));
  };

  // ── Notifications ───────────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const { notifications: data, unreadCount: cnt } = await notificationApi.getNotifications();
      setNotifications(data);
      setUnreadCount(cnt);
    } catch {
      // silent
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const markNotificationRead = async (id: string) => {
    await notificationApi.markOneRead(id);
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearNotifications = async () => {
    await notificationApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // ── Complaints ──────────────────────────────────────────────────────────────
  const loadComplaints = useCallback(async () => {
    try {
      const data = await complaintApi.getMyComplaints();
      setComplaints(data);
    } catch {
      // silent
    }
  }, []);

  const addComplaint = async (subject: string, description: string, bookingId?: string) => {
    const complaint = await complaintApi.createComplaint({ subject, description, bookingId });
    setComplaints(prev => [complaint, ...prev]);
    return complaint;
  };

  // ── Bookings & profile ────────────────────────────────────────────────────
  const addBooking = (payload: {
    serviceName: string;
    category: string;
    date: string;
    time: string;
    price: number;
    discount?: number;
    tax: number;
    totalPrice: number;
    address: string;
  }) => {
    const newBooking: Booking = {
      id: `AC-${Date.now().toString().slice(-4)}`,
      serviceName: payload.serviceName,
      category: payload.category,
      date: payload.date,
      time: payload.time,
      status: 'Pending',
      price: payload.price,
      discount: payload.discount || 0,
      tax: payload.tax,
      totalPrice: payload.totalPrice,
      address: payload.address,
      timeline: [
        { title: 'Booking Confirmed', desc: 'Your request has been received.', time: 'Now', done: true },
        { title: 'Technician Assigned', desc: 'A technician is being arranged.', time: 'Pending', done: false },
      ],
    };
    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const addAddress = (label: string, address: string) => {
    const newAddress = { id: Date.now().toString(), label, address };
    setUser(prev => prev ? { ...prev, addresses: [...prev.addresses, newAddress] } : { ...fallbackUser, addresses: [newAddress] });
  };

  const deleteAddress = (id: string) => {
    setUser(prev => prev ? { ...prev, addresses: prev.addresses.filter(item => item.id !== id) } : prev);
  };

  const updateProfile = async (payload: {
    name?: string;
    phone?: string;
    avatar?: string;
    city?: string;
    membership?: 'Standard' | 'Gold' | 'Platinum';
  }) => {
    const updated = await profileApi.updateProfile(payload);
    setUser(prev => prev ? {
      ...prev,
      ...updated,
      addresses: prev.addresses,
      membership: payload.membership ?? prev.membership,
    } : {
      ...fallbackUser,
      ...updated,
      addresses: fallbackUser.addresses,
      membership: payload.membership ?? fallbackUser.membership,
    });
  };

  const updateTechStatus = async (status: 'Available' | 'On Job' | 'Off Duty') => {
    await profileApi.updateStatus(status);
    setUser(prev => prev ? { ...prev, technicianStatus: status } : prev);
  };

  return (
    <AppContext.Provider value={{
      // auth
      user: user ?? fallbackUser, isAuthenticated: !!user, authLoading, authError, login, logout,
      // jobs
      jobs, jobsLoading, loadJobs, acceptJob, startJob,
      // notifications
      notifications, unreadCount, notifLoading, loadNotifications,
      markNotificationRead, clearNotifications,
      // complaints
      complaints, addComplaint, loadComplaints,
      // bookings & profile
      bookings, addBooking, addAddress, deleteAddress, updateProfile, updateTechStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
