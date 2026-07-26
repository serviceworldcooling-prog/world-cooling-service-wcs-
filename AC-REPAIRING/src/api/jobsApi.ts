import api from './client';

export type JobStatus = 'Pending' | 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Job {
  _id: string;
  bookingId: string;
  serviceType: string;
  problemDescription: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  lat: number | null;
  lng: number | null;
  isLiveLocation: boolean;
  status: JobStatus;
  price: number;
  finalPrice: number;
  isPaid: boolean;
  isEmergency: boolean;
  isOtpVerified: boolean;
  startOtpVerified: boolean;
  otpStatus: string;
  customerId: {
    _id: string;
    name: string;
    phone: string;
    avatar: string;
  };
  createdAt: string;
}

// GET /api/v1/technicians/my-jobs?status=
export const getMyJobs = async (status?: JobStatus): Promise<Job[]> => {
  const params = status ? { status } : {};
  const { data } = await api.get('/technicians/my-jobs', { params });
  return data.data; // sendPaginated wraps in data.data
};

// GET /api/v1/technicians/jobs/:bookingId
export const getJobById = async (bookingId: string): Promise<Job> => {
  const { data } = await api.get(`/technicians/jobs/${bookingId}`);
  return data.booking;
};

// PUT /api/v1/technicians/jobs/:bookingId/accept
export const acceptJob = async (bookingId: string): Promise<Job> => {
  const { data } = await api.put(`/technicians/jobs/${bookingId}/accept`);
  return data.booking;
};

// PUT /api/v1/technicians/jobs/:bookingId/start
export const startJob = async (bookingId: string): Promise<Job> => {
  const { data } = await api.put(`/technicians/jobs/${bookingId}/start`);
  return data.booking;
};

// GET /api/v1/technicians/earnings
export const getEarnings = async () => {
  const { data } = await api.get('/technicians/earnings');
  return data;
};
