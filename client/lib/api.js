import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mentra_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('mentra_token');
      localStorage.removeItem('mentra_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);

// ─── User ────────────────────────────────────────────────────────────────────
export const getProfile = () => api.get('/user/profile');
export const updateProfile = (data) => api.put('/user/profile', data);
export const getMentors = () => api.get('/user/mentors');
export const markNotificationsRead = () => api.post('/user/notifications/read');
export const completeTopic = (topic) => api.put('/user/progress/complete-topic', { topic });

// ─── AI ──────────────────────────────────────────────────────────────────────
export const generateLearningPath = (data) => api.post('/ai/generate-path', data);
export const chatWithAI = (data) => api.post('/ai/chat', data);
export const generateQuiz = (data) => api.post('/ai/quiz', data);
export const getRecommendations = (data) => api.post('/ai/recommendations', data);

// ─── Chat ────────────────────────────────────────────────────────────────────
export const sendMessage = (data) => api.post('/chat/send', data);
export const getChatHistory = (room, limit = 50) => api.get(`/chat/history/${room}?limit=${limit}`);
export const getChatRooms = () => api.get('/chat/rooms');

export default api;
