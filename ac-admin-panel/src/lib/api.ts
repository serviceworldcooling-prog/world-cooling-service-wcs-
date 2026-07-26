import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-login configuration for Admin Panel development/demo ease
const ADMIN_EMAIL = 'admin@acservice.com';
const ADMIN_PASSWORD = 'Admin@123456';

// Get token from localStorage if exists
export const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
};

// Set token in localStorage
export const setStoredToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token);
  }
};

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // If unauthorized (expired token), clear token and redirect to login
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    const errMsg = error.response?.data?.message || error.message || 'API request failed';
    return Promise.reject(new Error(errMsg));
  }
);

// Auth APIs
export const login = async (email: string, password: string): Promise<any> => {
  const res: any = await apiClient.post('/auth/login', { email, password });
  if (res?.token) {
    setStoredToken(res.token);
  }
  return res;
};

export const forgotPassword = async (email: string): Promise<any> => {
  return apiClient.post('/auth/forgot-password', { email });
};

export const verifyOtp = async (email: string, otp: string): Promise<any> => {
  return apiClient.post('/auth/verify-otp', { email, otp });
};

export const resetPassword = async (newPassword: string, resetToken: string): Promise<any> => {
  return apiClient.post('/auth/reset-password', { newPassword }, {
    headers: {
      Authorization: `Bearer ${resetToken}`
    }
  });
};

// Dashboard
export const getDashboardStats = async (): Promise<any> => {
  const res: any = await apiClient.get('/admin/dashboard');
  // Response interceptor returns response.data already, so res IS the data
  return res.data ?? res;
};

// Customers
export const getCustomers = async (search = '', page = 1, limit = 20): Promise<any> => {
  return apiClient.get('/admin/customers', { params: { search, page, limit } });
};

export const getCustomerById = async (id: string): Promise<any> => {
  const res: any = await apiClient.get(`/admin/customers/${id}`);
  return res.data ?? res;
};

export const updateCustomerStatus = async (id: string, status: 'Active' | 'Inactive' | 'Banned'): Promise<any> => {
  return apiClient.put(`/admin/customers/${id}/status`, { status });
};

// Technicians
export const getTechnicians = async (technicianStatus = '', search = '', page = 1, limit = 20): Promise<any> => {
  return apiClient.get('/admin/technicians', { params: { technicianStatus, search, page, limit } });
};

export const getTechnicianById = async (id: string): Promise<any> => {
  const res: any = await apiClient.get(`/admin/technicians/${id}`);
  return res.data ?? res;
};

export const createTechnician = async (payload: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  specialty?: string;
  city?: string;
  certifications?: string[];
}): Promise<any> => {
  return apiClient.post('/admin/technicians', payload);
};

export const updateTechnician = async (id: string, payload: any): Promise<any> => {
  return apiClient.put(`/admin/technicians/${id}`, payload);
};

export const uploadTechnicianAvatar = async (id: string, avatarBase64: string): Promise<any> => {
  return apiClient.put(`/admin/technicians/${id}/avatar`, { avatar: avatarBase64 });
};

export const deleteTechnician = async (id: string): Promise<any> => {
  return apiClient.delete(`/admin/technicians/${id}`);
};

// Bookings
export const getBookings = async (params?: any): Promise<any> => {
  return apiClient.get('/admin/bookings', { params });
};

export const getBookingById = async (id: string): Promise<any> => {
  const res: any = await apiClient.get(`/admin/bookings/${id}`);
  return res.data ?? res;
};

export const createBooking = async (payload: any): Promise<any> => {
  return apiClient.post('/admin/bookings', payload);
};

export const updateBooking = async (id: string, payload: any): Promise<any> => {
  return apiClient.put(`/admin/bookings/${id}`, payload);
};

export const assignTechnician = async (bookingId: string, technicianId: string, price?: number): Promise<any> => {
  return apiClient.put(`/admin/bookings/${bookingId}/assign`, { technicianId, price });
};

export const updateBookingStatus = async (bookingId: string, status: string, cancellationReason?: string): Promise<any> => {
  return apiClient.put(`/admin/bookings/${bookingId}/status`, { status, cancellationReason });
};

export const deleteBooking = async (id: string): Promise<any> => {
  return apiClient.delete(`/admin/bookings/${id}`);
};

export const getPendingAssignment = async (): Promise<any> => {
  return apiClient.get('/admin/bookings/pending-assignment');
};

// Work Reports
export const getWorkReports = async (params?: any): Promise<any> => {
  return apiClient.get('/work-reports', { params });
};

export const approveWorkReport = async (id: string): Promise<any> => {
  return apiClient.put(`/work-reports/${id}/approve`);
};

// Complaints
export const getComplaints = async (params?: any): Promise<any> => {
  return apiClient.get('/admin/complaints', { params });
};

export const updateComplaintStatus = async (id: string, status: string, adminNote?: string, priority?: string): Promise<any> => {
  return apiClient.put(`/admin/complaints/${id}/status`, { status, adminNote, priority });
};

export const saveComplaintAdminNote = async (id: string, adminNote: string): Promise<any> => {
  return apiClient.put(`/admin/complaints/${id}/note`, { adminNote });
};

export const deleteComplaint = async (id: string): Promise<any> => {
  return apiClient.delete(`/admin/complaints/${id}`);
};

// Service APIs
export const getServices = async (params?: {
  search?: string;
  category?: string;
  featured?: boolean;
}) => {
  return apiClient.get('/services', { params });
};

export const createService = async (payload: any): Promise<any> => {
  return apiClient.post('/services', payload);
};

export const updateService = async (id: string, payload: any): Promise<any> => {
  return apiClient.put(`/services/${id}`, payload);
};

export const deleteService = async (id: string): Promise<any> => {
  return apiClient.delete(`/services/${id}`);
};

// Notifications
export const broadcastNotification = async (payload: {
  title: string;
  body: string;
  type: 'booking' | 'offer' | 'payment' | 'general';
  targetAudience: 'all' | 'customers' | 'technicians' | 'single';
  targetUserId?: string;
}): Promise<any> => {
  return apiClient.post('/admin/notifications/broadcast', payload);
};

export const getAdminNotifications = async (): Promise<any> => {
  return apiClient.get('/admin/notifications');
};
