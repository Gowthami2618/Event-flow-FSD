import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally only for authenticated application requests
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/me');

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('eventflow_token');
      localStorage.removeItem('eventflow_user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
