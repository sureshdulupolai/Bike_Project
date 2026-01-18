/**
 * API Configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register/',
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  REFRESH_TOKEN: '/auth/token/refresh/',
  VERIFY_OTP: '/auth/verify-otp/',
  ME: '/auth/me/',
  
  // Inventory
  VEHICLES: '/inventory/vehicles/',
  VEHICLE_DETAIL: (id) => `/inventory/vehicles/${id}/`,
  UPDATE_STOCK: (id) => `/inventory/vehicles/${id}/update_stock/`,
  
  // Sales
  SALES: '/sales/sales/',
  SALE_DETAIL: (id) => `/sales/sales/${id}/`,
  VERIFY_SALE: (id) => `/sales/sales/${id}/verify/`,
  CANCEL_SALE: (id) => `/sales/sales/${id}/cancel/`,
  MY_PURCHASES: '/sales/sales/my_purchases/',
  
  // Service
  SERVICE_REQUESTS: '/service/requests/',
  SERVICE_DETAIL: (id) => `/service/requests/${id}/`,
  UPDATE_SERVICE_STATUS: (id) => `/service/requests/${id}/update_status/`,
  CANCEL_SERVICE: (id) => `/service/requests/${id}/cancel/`,
  MY_SERVICES: '/service/requests/my_services/',
  
  // Reports
  SALES_REPORT: '/reports/sales/',
  INVENTORY_REPORT: '/reports/inventory/',
  SERVICE_REPORT: '/reports/service/',
  DASHBOARD: '/reports/dashboard/',
};
