import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
};

export const documentsAPI = {
  getDocuments: () => api.get('/documents'),
  uploadDocument: (formData) => api.post('/documents/upload', formData),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

export const commentsAPI = {
  getComments: (documentId) => api.get(`/comments/${documentId}`),
  addComment: (documentId, comment) => api.post('/comments', { documentId, comment }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export default api;
