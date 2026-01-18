import api from './api';
import { API_ENDPOINTS } from '../config/api';

export const reportService = {
  /**
   * Get sales report
   */
  getSalesReport: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.SALES_REPORT, { params });
    return response.data;
  },

  /**
   * Get inventory report
   */
  getInventoryReport: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.INVENTORY_REPORT, { params });
    return response.data;
  },

  /**
   * Get service report
   */
  getServiceReport: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.SERVICE_REPORT, { params });
    return response.data;
  },

  /**
   * Get dashboard summary
   */
  getDashboard: async () => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD);
    return response.data;
  },
};
