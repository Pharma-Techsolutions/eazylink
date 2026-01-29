import axios from 'axios';
import { TokenManager, generateDeviceId } from './secureStorage';
import { Config } from '../constants/config';

const api = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const deviceId = await generateDeviceId();
    config.headers['X-Device-ID'] = deviceId;
  } catch (error) {
    console.error('Request setup error:', error);
  }
  return config;
});

export const authAPI = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name, gdpr_accepted: true }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  logout: () => api.post('/auth/logout').catch(() => {}),
};

export const callAPI = {
  initiateCall: (recipientId: string) =>
    api.post('/calls/initiate', { recipient_id: parseInt(recipientId) }),
  
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

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.patch('/users/me', data),
};

export default api;
