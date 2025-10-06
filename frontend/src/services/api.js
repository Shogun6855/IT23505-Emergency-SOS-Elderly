import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Emergency API functions
export const emergencyAPI = {
  trigger: (emergencyData) => api.post('/emergency/trigger', emergencyData),
  getActive: () => api.get('/emergency/active'),
  resolve: (id, notes) => api.put(`/emergency/${id}/resolve`, { resolution_notes: notes }),
  getHistory: (page = 1, limit = 10) => api.get(`/emergency/history?page=${page}&limit=${limit}`),
};

// User API functions
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getCaregivers: () => api.get('/users/caregivers'),
  addCaregiver: (caregiverData) => api.post('/users/caregivers', caregiverData),
  removeCaregiver: (caregiverId) => api.delete(`/users/caregivers/${caregiverId}`),
  getElders: () => api.get('/users/elders'),
};

// Medication API functions
export const medicationAPI = {
  addMedication: (medicationData) => api.post('/medications', medicationData),
  getUserMedications: () => api.get('/medications'),
  updateMedication: (id, medicationData) => api.put(`/medications/${id}`, medicationData),
  deleteMedication: (id) => api.delete(`/medications/${id}`),
  getTodaysMedications: () => api.get('/medications/today'),
  markMedicationTaken: (logId, notes) => api.put(`/medications/logs/${logId}/taken`, { notes }),
  markMedicationMissed: (logId, notes) => api.put(`/medications/logs/${logId}/missed`, { notes }),
};