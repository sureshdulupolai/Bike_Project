import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const serviceService = {
  /**
   * Get all service requests
   */
  getAll: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.SERVICE_REQUESTS, { params });
    return response.data;
  },

  /**
   * Get service request by ID
   */
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.SERVICE_DETAIL(id));
    return response.data;
  },

  /**
   * Book service
   */
  book: async (vehicleId, description, scheduledDate = null, notes = '') => {
    const response = await api.post(API_ENDPOINTS.SERVICE_REQUESTS, {
      vehicle: vehicleId,
      description,
      scheduled_date: scheduledDate,
      notes,
    });
    return response.data;
  },

  /**
   * Update service request (Admin only)
   */
  update: async (id, data) => {
    const response = await api.patch(API_ENDPOINTS.SERVICE_DETAIL(id), data);
    return response.data;
  },

  /**
   * Update service status (Admin only)
   */
  updateStatus: async (id, status, cost = null, notes = '') => {
    const response = await api.patch(API_ENDPOINTS.UPDATE_SERVICE_STATUS(id), {
      status,
      cost,
      notes,
    });
    return response.data;
  },

  /**
   * Cancel service request
   */
  cancel: async (id) => {
    const response = await api.patch(API_ENDPOINTS.CANCEL_SERVICE(id));
    return response.data;
  },

  /**
   * Get my services (Customer only)
   */
  getMyServices: async () => {
    const response = await api.get(API_ENDPOINTS.MY_SERVICES);
    return response.data;
  },
};
