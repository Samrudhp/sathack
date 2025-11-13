import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================
// USER APIs
// ============================================

export const scanImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await api.post('/scan_image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const voiceInput = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice.webm');
  const response = await api.post('/voice_input', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const ragQuery = async (query) => {
  const response = await api.post('/rag_query', { query });
  return response.data;
};

export const getImpactStats = async (userId) => {
  const response = await api.get(`/impact_stats/${userId}`);
  return response.data;
};

export const getTokenBalance = async (userId) => {
  const response = await api.get(`/token_balance/${userId}`);
  return response.data;
};

export const redeemToken = async (tokenCode) => {
  const response = await api.post('/user/redeem_token', { token: tokenCode });
  return response.data;
};

// ============================================
// RECYCLER APIs
// ============================================

export const recyclerLogin = async (email, password) => {
  const response = await api.post('/recycler/login', { email, password });
  return response.data;
};

export const getItemsPending = async () => {
  const response = await api.get('/recycler/items_pending');
  return response.data;
};

export const recyclerSubmit = async (scanId, data) => {
  const response = await api.post(`/recycler/submit/${scanId}`, data);
  return response.data;
};

// ============================================
// MARKETPLACE APIs
// ============================================

export const getRecyclersNearby = async (lat, lon, material) => {
  const response = await api.get('/recyclers_nearby', {
    params: { lat, lon, material },
  });
  return response.data;
};

export const schedulePickup = async (data) => {
  const response = await api.post('/schedule_pickup', data);
  return response.data;
};

export default api;
