import { create } from 'zustand';
import * as authApi from '../api/authApi';
import * as userApi from '../api/userApi';
import * as bookingApi from '../api/bookingApi';
import { getToken, removeToken } from '../api/client';

// ─── Types ────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  walletBalance: number;
  hasMembership: boolean;
}

export interface Address {
  _id: string;
  id?: string;
  label: string;
  address: string;
  city?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface Booking {
  _id: string;
  bookingId: string;
  serviceType: string;
  // Legacy fields kept for backward compat with screens that use them
  categoryTitle?: string;
  technicianName: string;
  techAvatar?: string;
  preferredDate: string;
  preferredTime: string;
  // Alias getters used by older screens
  date?: string;
  time?: string;
  status: 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled';
  price: number;
  isPaid: boolean;
  address: string;
  problemDescription?: string;
  description?: string;
  isEmergency: boolean;
  isOtpVerified: boolean;
  createdAt: string;
}

// ─── State interface ──────────────────────────────────
interface AppState {
  // App settings
  themeMode: 'light' | 'dark' | 'system';
  language: string;

  // Auth
  isAuthenticated: boolean;
  user: User | null;
  authLoading: boolean;
  authError: string | null;
  locationPermissionGranted: boolean;
  notificationPermissionGranted: boolean;

  // Forgot-password flow — store email across screens
  forgotPasswordEmail: string;
  resetToken: string | null;

  // Addresses
  addresses: Address[];
  addressesLoading: boolean;

  // Bookings
  bookings: Booking[];
  bookingsLoading: boolean;
  activeBooking: Booking | null;

  // ── Actions ───────────────────────────────────────
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: string) => void;
  setPermissions: (location: boolean, notifications: boolean) => void;
  setForgotPasswordEmail: (email: string) => void;

  // Auth actions
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email?: string, phone?: string) => Promise<void>;

  // Address actions
  loadAddresses: () => Promise<void>;
  addAddress: (label: string, address: string, city?: string, lat?: number, lng?: number) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;

  // Booking actions
  loadBookings: (status?: bookingApi.BookingStatus) => Promise<void>;
  createBooking: (payload: bookingApi.CreateBookingPayload) => Promise<Booking>;
  createEmergencyBooking: (payload: { address?: string; lat?: number | null; lng?: number | null; description?: string }) => Promise<Booking>;
  cancelBooking: (id: string, reason?: string) => Promise<void>;
  rescheduleBooking: (id: string, date: string, time: string) => Promise<void>;
  completeBooking: (id: string) => Promise<void>;

  // Wallet helper (update local balance after transactions)
  updateWalletBalance: (balance: number) => void;
}

// ─── Normalize booking from API → store shape ─────────
const normalizeBooking = (b: bookingApi.Booking): Booking => ({
  ...b,
  // Alias fields so old screens still work
  categoryTitle: b.serviceType,
  date: b.preferredDate,
  time: b.preferredTime,
  description: b.problemDescription,
});

// ─── Store ────────────────────────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  themeMode: 'light',
  language: 'English',

  isAuthenticated: false,
  user: null,
  authLoading: false,
  authError: null,
  locationPermissionGranted: false,
  notificationPermissionGranted: false,

  forgotPasswordEmail: '',
  resetToken: null,

  addresses: [],
  addressesLoading: false,

  bookings: [],
  bookingsLoading: false,
  activeBooking: null,

  // ── Settings ─────────────────────────────────────────
  setThemeMode: (mode) => set({ themeMode: mode }),
  setLanguage: (lang) => set({ language: lang }),
  setPermissions: (location, notifications) =>
    set({ locationPermissionGranted: location, notificationPermissionGranted: notifications }),
  setForgotPasswordEmail: (email) => set({ forgotPasswordEmail: email }),

  // ── Auth ─────────────────────────────────────────────

  // Called on app start (_layout.tsx) — restores session if token exists
  initAuth: async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const user = await authApi.getMe();
      set({ isAuthenticated: true, user });
    } catch {
      // Token expired or invalid — clear silently
      await removeToken();
      set({ isAuthenticated: false, user: null });
    }
  },

  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await authApi.login({ email, password });
      set({
        isAuthenticated: true,
        user: res.user as User,
        authLoading: false,
        authError: null,
      });
    } catch (err: any) {
      set({ authLoading: false, authError: err.message });
      throw err;
    }
  },

  register: async (name, email, phone, password) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await authApi.register({ name, email, phone, password });
      set({
        isAuthenticated: true,
        user: res.user as User,
        authLoading: false,
        authError: null,
      });
    } catch (err: any) {
      set({ authLoading: false, authError: err.message });
      throw err;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({
      isAuthenticated: false,
      user: null,
      bookings: [],
      addresses: [],
      activeBooking: null,
      authError: null,
    });
  },

  updateProfile: async (name, email, phone) => {
    const updated = await userApi.updateProfile({ name, phone });
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null,
    }));
  },

  // ── Addresses ─────────────────────────────────────────
  loadAddresses: async () => {
    set({ addressesLoading: true });
    try {
      const addresses = await userApi.getAddresses();
      set({ 
        addresses: addresses.map((a: any) => ({ ...a, id: a._id })), 
        addressesLoading: false 
      });
    } catch {
      set({ addressesLoading: false });
    }
  },

  addAddress: async (label, address, city, lat, lng) => {
    const updated = await userApi.addAddress({ label, address, city, lat, lng });
    set({ addresses: updated.map((a: any) => ({ ...a, id: a._id })) });
  },

  removeAddress: async (id) => {
    const updated = await userApi.deleteAddress(id);
    set({ addresses: updated.map((a: any) => ({ ...a, id: a._id })) });
  },

  // ── Bookings ──────────────────────────────────────────
  loadBookings: async (status) => {
    set({ bookingsLoading: true });
    try {
      const raw = await bookingApi.getMyBookings(status);
      set({ bookings: raw.map(normalizeBooking), bookingsLoading: false });
    } catch (err: any) {
      console.error('[loadBookings error]', err?.message ?? err);
      set({ bookingsLoading: false });
    }
  },

  createBooking: async (payload) => {
    const raw = await bookingApi.createBooking(payload);
    const booking = normalizeBooking(raw);
    set((state) => ({
      bookings: [booking, ...state.bookings],
      activeBooking: booking,
    }));
    return booking;
  },

  createEmergencyBooking: async (payload) => {
    const { booking: raw } = await bookingApi.createEmergencyBooking(payload);
    const booking = normalizeBooking(raw);
    set((state) => ({
      bookings: [booking, ...state.bookings],
      activeBooking: booking,
    }));
    return booking;
  },

  cancelBooking: async (id, reason) => {
    const raw = await bookingApi.cancelBooking(id, reason);
    const updated = normalizeBooking(raw);
    set((state) => ({
      bookings: state.bookings.map((b) => (b._id === id ? updated : b)),
      activeBooking: state.activeBooking?._id === id ? updated : state.activeBooking,
    }));
  },

  rescheduleBooking: async (id, date, time) => {
    const raw = await bookingApi.rescheduleBooking(id, date, time);
    const updated = normalizeBooking(raw);
    set((state) => ({
      bookings: state.bookings.map((b) => (b._id === id ? updated : b)),
    }));
  },

  completeBooking: async (id) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b._id === id ? { ...b, status: 'Completed' as const } : b
      ),
    }));
  },

  updateWalletBalance: (balance) =>
    set((state) => ({
      user: state.user ? { ...state.user, walletBalance: balance } : null,
    })),
}));
