/**
 * Updated API Service
 * Integrates secure token storage and automatic token refresh
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { TokenManager, SecureStorageManager, generateDeviceId } from './secureStorage';
import { Config } from '../constants/config';

/**
 * Create axios instance with security interceptors
 */
const api: AxiosInstance = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== REQUEST INTERCEPTOR =====
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get valid token (refreshes if needed)
      const token = await TokenManager.getValidAccessToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add device ID for security
      const deviceId = await generateDeviceId();
      config.headers['X-Device-ID'] = deviceId;

      // Add timestamp for replay attack prevention
      config.headers['X-Request-Timestamp'] = Date.now().toString();

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const newToken = await TokenManager.refreshAccessToken();
        
        if (newToken) {
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed, clear and redirect to login
          await TokenManager.clearTokens();
          // TODO: Navigate to login screen
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await TokenManager.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    // Handle 429 (Rate Limited)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    }

    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      gdpr_accepted: true,
    });

    // Store tokens securely
    if (response.data.token) {
      await TokenManager.storeTokens(
        response.data.token,
        response.data.refresh_token,
        response.data.user.id
      );
    }

    return response;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });

    // Store tokens securely
    if (response.data.token) {
      await TokenManager.storeTokens(
        response.data.token,
        response.data.refresh_token,
        response.data.user.id
      );
    }

    return response;
  },

  logout: async () => {
    try {
      // Notify backend of logout
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout notification failed:', error);
    } finally {
      // Always clear local tokens
      await TokenManager.clearTokens();
    }
  },

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  requestPasswordReset: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, new_password: newPassword }),

  enableTwoFA: () =>
    api.post('/auth/2fa/enable'),

  verifyTwoFA: (code: string) =>
    api.post('/auth/2fa/verify', { code }),
};

// ===== CALL API =====
export const callAPI = {
  initiateCall: (recipientId: string) =>
    api.post('/calls/initiate', { recipient_id: recipientId }),

  getCallVerificationCode: (callId: string) =>
    api.get(`/calls/${callId}/verification-code`),

  confirmCallCode: (callId: string, code: string) =>
    api.post(`/calls/${callId}/confirm-code`, { code }),

  endCall: (callId: string, durationSeconds: number) =>
    api.post(`/calls/${callId}/end`, { duration_seconds: durationSeconds }),

  getCallHistory: (limit = 50, offset = 0) =>
    api.get(`/calls/history?limit=${limit}&offset=${offset}`),

  reportCall: (callId: string, reason: string, description?: string) =>
    api.post(`/calls/${callId}/report`, { reason, description }),
};

// ===== CONTACT API =====
export const contactAPI = {
  getContacts: () =>
    api.get('/contacts'),

  blockUser: (userId: string, reason?: string) =>
    api.post('/contacts/block', { user_id: userId, reason }),

  unblockUser: (userId: string) =>
    api.delete(`/contacts/block/${userId}`),

  getBlockedUsers: () =>
    api.get('/contacts/blocked'),
};

// ===== USER API =====
export const userAPI = {
  getProfile: () => 
    api.get('/users/me'),

  updateProfile: (data: any) => 
    api.patch('/users/me', data),

  updatePrivacySettings: (settings: {
    allow_unknown_calls?: boolean;
    auto_delete_call_logs?: boolean;
    call_logs_retention_days?: number;
  }) =>
    api.patch('/users/me/privacy', settings),

  deleteAccount: () =>
    api.delete('/users/me'),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/users/me/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    }),
};

// ===== NETWORK API =====
export const networkAPI = {
  scanNetworks: (networks: any[], location?: any) =>
    api.post('/networks/scan', { networks, location }),

  logConnection: (networkData: any) =>
    api.post('/networks/connect', networkData),

  getHistory: (limit = 50, offset = 0) =>
    api.get(`/networks/history?limit=${limit}&offset=${offset}`),
};

export default api;
