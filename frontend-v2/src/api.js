import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', error.response.status, error.response.data);
      throw new Error(error.response.data?.detail || `API Error: ${error.response.status}`);
    } else if (error.request) {
      // Request made but no response
      console.error('API No Response:', error.request);
      throw new Error('No response from server. Please check if backend is running.');
    } else {
      // Error in request setup
      console.error('API Request Error:', error.message);
      throw error;
    }
  }
);

// ============================================
// SCAN & VOICE APIs
// ============================================

// Scan image with full pipeline
export const scanImage = async (imageFile, userId, latitude, longitude, language = 'en') => {
  console.log('scanImage called with:', {
    fileType: imageFile.type,
    fileSize: imageFile.size,
    userId,
    latitude,
    longitude,
    language
  });

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('user_id', userId);
  formData.append('latitude', latitude.toString());
  formData.append('longitude', longitude.toString());
  formData.append('language', language);
  
  console.log('Sending POST to:', `${API_BASE}/scan_image`);
  
  try {
    const response = await api.post('/scan_image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Scan response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Voice input with Whisper transcription
export const voiceInput = async (audioBlob, userId, latitude, longitude, language = 'en') => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice.webm');
  formData.append('user_id', userId);
  if (latitude) formData.append('latitude', latitude.toString());
  if (longitude) formData.append('longitude', longitude.toString());
  formData.append('language', language);
  
  const response = await api.post('/voice_input', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// RAG query (text-based)
export const ragQuery = async (userId, query, language = 'en') => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('query', query);
  formData.append('language', language);
  
  const response = await api.post('/rag_query', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ============================================
// MARKETPLACE APIs
// ============================================

// Get nearby recyclers with ranking
export const getRecyclersNearby = async (lat, lon, material = null, weight_kg = 1.0) => {
  const response = await api.get('/recyclers_nearby', {
    params: { lat, lon, material, weight_kg },
  });
  return response.data;
};

// Schedule pickup
export const schedulePickup = async (pickupData) => {
  const formData = new FormData();
  Object.keys(pickupData).forEach(key => {
    if (pickupData[key] !== undefined && pickupData[key] !== null) {
      formData.append(key, pickupData[key].toString());
    }
  });
  
  const response = await api.post('/schedule_pickup', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ============================================
// IMPACT & TOKENS APIs
// ============================================

// Get user impact stats
export const getImpactStats = async (userId, scope = 'user', period = 'all_time') => {
  const response = await api.get('/impact_stats', {
    params: { user_id: userId, scope, period },
  });
  return response.data;
};

// Get token balance (wallet)
export const getTokenBalance = async (userId) => {
  const response = await api.get(`/wallet/${userId}`);
  return response.data;
};

// Redeem token
export const redeemToken = async (userId, tokenId) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('token_id', tokenId);
  
  const response = await api.post('/user/redeem_token', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ============================================
// USER APIs
// ============================================

// Register new user
export const registerUser = async (userData) => {
  const response = await api.post('/user/register', userData);
  return response.data;
};

// Get user profile
export const getUserProfile = async (userId) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

export default api;
