import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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
export const submitOnboarding = (data) => api.post('/user/onboarding', data);
export const markNotificationsRead = () => api.post('/user/notifications/read');
export const completeTopic = (topic) => api.put('/user/progress/complete-topic', { topic });

// ─── AI ──────────────────────────────────────────────────────────────────────
export const generateAIProfile = (data) => api.post('/ai/generate-profile', data);
export const getAIProfile = () => api.get('/ai/profile');
export const getNextAction = () => api.get('/ai/next-action');
export const updateActionStatus = (data) => api.post('/ai/next-action/status', data);
export const chatWithAI = (data) => api.post('/ai/chat', data);
export const mentorChat = (data) => api.post('/ai/mentor-chat', data);
export const getMentorChatHistory = () => api.get('/ai/mentor-chat/history');
export const generateQuiz = (data) => api.post('/ai/quiz', data);
export const getRecommendations = (data) => api.post('/ai/recommendations', data);
export const getDailyInsights = () => api.get('/ai/daily-insights');
export const refreshDailyInsights = () => api.post('/ai/daily-insights/refresh');
export const submitInsightAnswer = (data) => api.post('/ai/daily-insights/answer', data);

// ─── Chat (legacy rooms) ────────────────────────────────────────────────────
export const sendMessage = (data) => api.post('/chat/send', data);
export const getChatHistory = (room, limit = 50) => api.get(`/chat/history/${room}?limit=${limit}`);
export const getChatRooms = () => api.get('/chat/rooms');
export const getMentors = () => api.get('/chat/mentors');

// ─── Mentor ────────────────────────────────────────────────────────────────
export const getMentorStats = () => api.get('/mentor/stats');
export const getMentorStudents = () => api.get('/mentor/students');
export const getMentorSessions = () => api.get('/mentor/sessions');
export const getMentorTasks = () => api.get('/mentor/tasks');
export const getMentorAnalytics = () => api.get('/mentor/analytics');

// ─── Communities ────────────────────────────────────────────────────────────
export const getCommunities = (search = '') => api.get(`/communities${search ? `?search=${encodeURIComponent(search)}` : ''}`);
export const getMyCommunities = () => api.get('/communities/me');
export const getCommunity = (id) => api.get(`/communities/${id}`);
export const createCommunity = (data) => api.post('/communities', data);
export const joinCommunity = (id) => api.post(`/communities/${id}/join`);
export const leaveCommunity = (id) => api.post(`/communities/${id}/leave`);
export const getCommunityMessages = (id, limit = 50) => api.get(`/communities/${id}/messages?limit=${limit}`);
export const sendCommunityMessage = (id, content) => api.post(`/communities/${id}/messages`, { content });

// ─── Journey ────────────────────────────────────────────────────────────────
export const startJourney = (data) => api.post('/journey/start', data);
export const getMyJourney = () => api.get('/journey/me');
export const getTodayTasks = () => api.get('/journey/tasks/today');
export const completeJourneyTask = (taskId) => api.post(`/journey/task/${taskId}/complete`);
export const submitJourneyQuiz = (taskId, answers) => api.post(`/journey/task/${taskId}/submit-quiz`, { answers });
export const getJourneyRewards = () => api.get('/journey/rewards');

export default api;
