import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const salesService = {
  /**
   * Get all sales
   */
  getAll: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.SALES, { params });
    return response.data;
  },

  /**
   * Get sale by ID
   */
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.SALE_DETAIL(id));
    return response.data;
  },

  /**
   * Purchase vehicle
   */
  purchase: async (vehicleId, quantity = 1, notes = '') => {
    const response = await api.post(API_ENDPOINTS.SALES, {
      vehicle: vehicleId,
      quantity,
      notes,
    });
    return response.data;
  },

  /**
   * Verify sale (Admin only)
   */
  verify: async (id) => {
    const response = await api.patch(API_ENDPOINTS.VERIFY_SALE(id));
    return response.data;
  },

  /**
   * Cancel sale
   */
  cancel: async (id) => {
    const response = await api.patch(API_ENDPOINTS.CANCEL_SALE(id));
    return response.data;
  },

  /**
   * Get my purchases (Customer only)
   */
  getMyPurchases: async () => {
    const response = await api.get(API_ENDPOINTS.MY_PURCHASES);
    return response.data;
  },
};
