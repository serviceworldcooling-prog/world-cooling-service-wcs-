import api from './client';

// POST /api/v1/service-otp/verify-start
// Technician verifies the OTP that customer shows them to begin job
export const verifyStartOtp = async (bookingId: string, otp: string) => {
  const { data } = await api.post('/service-otp/verify-start', { bookingId, otp });
  return data;
};

// POST /api/v1/service-otp/generate-end/:bookingId
// Technician generates endOTP after finishing work (alternative to workReport flow)
export const generateEndOtp = async (bookingId: string) => {
  const { data } = await api.post(`/service-otp/generate-end/${bookingId}`);
  return data;
};

// GET /api/v1/service-otp/status/:bookingId — for display
export const getOtpStatus = async (bookingId: string) => {
  const { data } = await api.get(`/service-otp/status/${bookingId}`);
  return data;
};
