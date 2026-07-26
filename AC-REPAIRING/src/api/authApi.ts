import api, { saveToken, clearToken } from './client';

export interface UserAddress {
  id: string;
  label: string;
  address: string;
}

export interface TechnicianUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'technician';
  specialty: string;
  rating: number;
  completedJobs: number;
  earnings: number;
  city: string;
  certifications: string[];
  technicianStatus: 'Available' | 'On Job' | 'Off Duty';
  status: 'Active' | 'Inactive' | 'Banned';
  addresses: UserAddress[];
  membership: 'Standard' | 'Gold' | 'Platinum';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: TechnicianUser;
}

/**
 * POST /api/v1/auth/technician/login
 * Login for the AC-REPAIRING technician app.
 * identifier = phone number OR email (as added by admin)
 * password   = password set by admin when creating the technician account
 */
export const login = async (identifier: string, password: string): Promise<AuthResponse> => {
  console.log('\n🔑 ── Technician Login ─────────────────────────────');
  console.log(`   Sending to: POST /auth/technician/login`);
  console.log(`   Identifier: "${identifier}"`);

  const { data } = await api.post<AuthResponse>('/auth/technician/login', {
    identifier: identifier.trim(),
    password,
  });

  console.log(`   ✅ Login success — role: ${data.user.role}, name: ${data.user.name}`);
  console.log(`   💾 Saving token to SecureStore...`);
  await saveToken(data.token);
  console.log(`   ✅ Token saved`);
  console.log('🔑 ──────────────────────────────────────────────\n');
  return data;
};

// GET /api/v1/auth/me  — restore session on app start
export const getMe = async (): Promise<TechnicianUser> => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

// POST /api/v1/auth/forgot-password  — request OTP to reset password
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

// POST /api/v1/auth/verify-otp  — verify OTP and get reset token
export const verifyOtp = async (
  email: string,
  otp: string
): Promise<{ success: boolean; resetToken: string }> => {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data;
};

// POST /api/v1/auth/reset-password  — reset password using reset token
export const resetPassword = async (
  newPassword: string,
  resetToken: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post(
    '/auth/reset-password',
    { newPassword },
    { headers: { Authorization: `Bearer ${resetToken}` } }
  );
  return data;
};

// Logout — clear local token
export const logout = async () => {
  await clearToken();
};

