import apiClient from './client';

export interface TrackingInfo {
  bookingId: string;
  status: string;
  serviceType: string;
  address: string;
  technicianName: string;
  techAvatar: string;
  isOtpVerified: boolean;
  estimatedArrivalMinutes: number;
  technicianLocation: { lat: number; lng: number };
  customerLocation: { lat: number | null; lng: number | null };
}

// GET /api/tracking/:bookingId
export const getTrackingInfo = async (bookingId: string): Promise<TrackingInfo> => {
  const { data } = await apiClient.get(`/tracking/${bookingId}`);
  return data.tracking;
};

// POST /api/tracking/:bookingId/verify-otp
export const verifyStartOtp = async (bookingId: string, otp: string) => {
  const { data } = await apiClient.post(`/tracking/${bookingId}/verify-otp`, { otp });
  return data;
};

// PUT /api/tracking/:bookingId/complete
export const confirmComplete = async (bookingId: string) => {
  const { data } = await apiClient.put(`/tracking/${bookingId}/complete`);
  return data;
};
