import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (email, otpCode) => {
    const response = await api.post(API_ENDPOINTS.VERIFY_OTP, { email, otp_code: otpCode });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post(API_ENDPOINTS.LOGOUT, { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.ME);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData) => {
    const response = await api.patch(API_ENDPOINTS.ME, userData);
    return response.data;
  },
};
