import apiClient, { saveToken, removeToken } from './client';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    walletBalance: number;
    hasMembership: boolean;
  };
}

// POST /api/auth/register
export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  await saveToken(data.token);
  return data;
};

// POST /api/auth/login
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  await saveToken(data.token);
  return data;
};

// GET /api/auth/me — restore session on app start
export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data.user;
};

// POST /api/auth/forgot-password
export const forgotPassword = async (email: string) => {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
};

// POST /api/auth/verify-otp
export const verifyOtp = async (email: string, otp: string) => {
  const { data } = await apiClient.post('/auth/verify-otp', { email, otp });
  // Store the resetToken so reset-password screen can use it
  if (data.resetToken) await saveToken(data.resetToken);
  return data;
};

// POST /api/auth/resend-otp
export const resendOtp = async (email: string) => {
  const { data } = await apiClient.post('/auth/resend-otp', { email });
  return data;
};

// POST /api/auth/reset-password
export const resetPassword = async (newPassword: string) => {
  const { data } = await apiClient.post('/auth/reset-password', { newPassword });
  return data;
};

// Logout — just clear token locally
export const logout = async () => {
  await removeToken();
};
