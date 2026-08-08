import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ─── Change this to your machine's local IP when testing on a physical device ───
// For Android emulator use: http://10.0.2.2:5000/api/v1
// For physical device: set EXPO_PUBLIC_API_BASE_URL in .env file
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.53.251:5000/api/v1';

const TOKEN_KEY = 'ac_customer_token';

// ─── Token helpers using SecureStore ──────────────────
export const saveToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save secure token:', e);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to read secure token:', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove secure token:', e);
  }
};

// ─── Axios instance ───────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token on every request & print terminal logs
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`\n📡 [CUSTOMER APP REQUEST] ${config.method?.toUpperCase()} ${fullUrl}`);
    if (config.data) {
      const sanitized = { ...config.data };
      if (sanitized.password) sanitized.password = '••••••••';
      console.log(`   Body: ${JSON.stringify(sanitized)}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize error messages & print terminal logs
apiClient.interceptors.response.use(
  (response) => {
    const status = response.status;
    const url = response.config.url;
    console.log(` ✅ [CUSTOMER APP RESPONSE] ${response.config.method?.toUpperCase()} ${url} → ${status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    console.log(` ❌ [CUSTOMER APP ERROR] ${error.config?.method?.toUpperCase()} ${url} → ${status || 'NETWORK_ERR'}: ${message}`);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
