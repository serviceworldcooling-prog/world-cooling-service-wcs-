import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ─── Base URL ─────────────────────────────────────────────────────────────────
// Android emulator → use 10.0.2.2
// Physical device  → use your machine's LAN IP (run: ipconfig | findstr IPv4)
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.53.251:5000/api/v1';

export const TOKEN_KEY = 'tech_token'; // SecureStore keys must not start with @

// ─── Token helpers (expo-secure-store — works in Expo Go, no native build) ────
export const saveToken  = (t: string) => SecureStore.setItemAsync(TOKEN_KEY, t);
export const getToken   = ()          => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = ()          => SecureStore.deleteItemAsync(TOKEN_KEY);

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach JWT + log every outgoing call ───────────────
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = (config.method ?? 'GET').toUpperCase();
  const url    = `${config.baseURL}${config.url}`;
  console.log(`\n📡 [API REQUEST]  ${method} ${url}`);
  if (config.data) {
    // Mask password from logs
    const safeData = { ...config.data };
    if (safeData.password) safeData.password = '••••••••';
    console.log(`   Body: ${JSON.stringify(safeData)}`);
  }
  return config;
});

// ─── Response interceptor — log every response / error ───────────────────────
api.interceptors.response.use(
  (res) => {
    const method = (res.config.method ?? 'GET').toUpperCase();
    const url    = res.config.url ?? '';
    console.log(`✅ [API RESPONSE] ${method} ${url} → ${res.status}`);
    return res;
  },
  (err) => {
    const method  = (err.config?.method ?? 'GET').toUpperCase();
    const url     = err.config?.url ?? '';
    const status  = err.response?.status ?? 'NO_RESPONSE';
    const message = err.response?.data?.message ?? err.message;
    console.log(`❌ [API ERROR]    ${method} ${url} → ${status}: ${message}`);
    return Promise.reject(new Error(message || 'Something went wrong. Please try again.'));
  }
);

export default api;
