import apiClient from './client';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled';

export interface Booking {
  _id: string;
  bookingId: string;
  serviceType: string;
  problemDescription: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  isLiveLocation: boolean;
  technicianName: string;
  techAvatar: string;
  status: BookingStatus;
  price: number;
  isPaid: boolean;
  paymentMethod: string | null;
  isEmergency: boolean;
  isOtpVerified: boolean;
  createdAt: string;
}

export interface CreateBookingPayload {
  serviceType: string;
  problemDescription?: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  isLiveLocation?: boolean;
  price?: number;
}

// POST /api/bookings
export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
  const res: any = await apiClient.post('/bookings', payload);
  return res?.booking ?? res?.data?.booking;
};

// POST /api/bookings/emergency
export const createEmergencyBooking = async (payload: {
  address?: string;
  lat?: number | null;
  lng?: number | null;
  description?: string;
}): Promise<{ booking: Booking; eta: number }> => {
  const res: any = await apiClient.post('/bookings/emergency', payload);
  return { booking: res?.booking ?? res?.data?.booking, eta: res?.eta ?? res?.data?.eta ?? 25 };
};

// GET /api/bookings?status=
export const getMyBookings = async (status?: BookingStatus): Promise<Booking[]> => {
  // Note: the axios interceptor in client.ts returns response.data directly,
  // so the result here IS the parsed JSON body: { success, count, bookings }
  const res: any = await apiClient.get('/bookings', { params: status ? { status } : {} });
  return res?.bookings ?? res?.data?.bookings ?? [];
};

// GET /api/bookings/:id
export const getBookingById = async (id: string): Promise<Booking> => {
  const res: any = await apiClient.get(`/bookings/${id}`);
  return res?.booking ?? res?.data?.booking;
};

// PUT /api/bookings/:id/cancel
export const cancelBooking = async (id: string, reason?: string): Promise<Booking> => {
  const res: any = await apiClient.put(`/bookings/${id}/cancel`, { reason });
  return res?.booking ?? res?.data?.booking;
};

// PUT /api/bookings/:id/reschedule
export const rescheduleBooking = async (id: string, newDate: string, newTime: string): Promise<Booking> => {
  const res: any = await apiClient.put(`/bookings/${id}/reschedule`, { newDate, newTime });
  return res?.booking ?? res?.data?.booking;
};
