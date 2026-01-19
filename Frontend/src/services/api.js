import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token and ensure proper headers
api.interceptors.request.use(
  (config) => {
    // Ensure Content-Type is set to JSON
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/token/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
