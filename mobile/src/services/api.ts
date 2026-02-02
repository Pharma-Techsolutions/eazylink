import axios from 'axios';
import { TokenManager, generateDeviceId } from './secureStorage';

// Hardcode API URL for production
const API_URL = 'https://eazylink-api-ba6e90685826.herokuapp.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
};

export const callAPI = {
  initiateCall: (recipientId: string) =>
    api.post('/calls/initiate', { recipient_id: parseInt(recipientId) }),
  
  endCall: (callId: string, durationSeconds: number) =>
    api.post(`/calls/${callId}/end`, { duration_seconds: durationSeconds }),
  
  getCallHistory: (limit = 50, offset = 0) =>
    api.get(`/calls/history?limit=${limit}&offset=${offset}`),
};

export const agoraAPI = {
  getToken: (channelName: string, uid: number) =>
    api.post('/agora/token', { channel_name: channelName, uid }),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
};

export default api;
