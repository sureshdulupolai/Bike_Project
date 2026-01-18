import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const vehicleService = {
  /**
   * Get all vehicles
   */
  getAll: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.VEHICLES, { params });
    return response.data;
  },

  /**
   * Get vehicle by ID
   */
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.VEHICLE_DETAIL(id));
    return response.data;
  },

  /**
   * Create vehicle (Admin only)
   */
  create: async (vehicleData) => {
    const formData = new FormData();
    Object.keys(vehicleData).forEach(key => {
      if (vehicleData[key] !== null && vehicleData[key] !== undefined) {
        formData.append(key, vehicleData[key]);
      }
    });
    const response = await api.post(API_ENDPOINTS.VEHICLES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update vehicle (Admin only)
   */
  update: async (id, vehicleData) => {
    const formData = new FormData();
    Object.keys(vehicleData).forEach(key => {
      if (vehicleData[key] !== null && vehicleData[key] !== undefined) {
        formData.append(key, vehicleData[key]);
      }
    });
    const response = await api.patch(API_ENDPOINTS.VEHICLE_DETAIL(id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Delete vehicle (Admin only)
   */
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.VEHICLE_DETAIL(id));
    return response.data;
  },

  /**
   * Update stock (Admin only)
   */
  updateStock: async (id, quantity, action = 'add') => {
    const response = await api.post(API_ENDPOINTS.UPDATE_STOCK(id), {
      quantity,
      action,
    });
    return response.data;
  },
};
