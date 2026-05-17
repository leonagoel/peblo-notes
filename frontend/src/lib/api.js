import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('peblo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('peblo_token');
      localStorage.removeItem('peblo_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Notes ─────────────────────────────────────
export const notesAPI = {
  list: (params) => api.get('/notes', { params }),
  create: (data) => api.post('/notes', data),
  get: (id) => api.get(`/notes/${id}`),
  update: (id, data) => api.patch(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  generateSummary: (id) => api.post(`/notes/${id}/generate-summary`),
  generateActions: (id) => api.post(`/notes/${id}/generate-actions`),
  generateTitle: (id) => api.post(`/notes/${id}/generate-title`),
};

// ── Shared ────────────────────────────────────
export const sharedAPI = {
  get: (shareId) => api.get(`/shared/${shareId}`),
};

// ── Insights ──────────────────────────────────
export const insightsAPI = {
  get: () => api.get('/insights'),
};
