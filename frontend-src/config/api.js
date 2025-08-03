// API Configuration
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3003'
  : window.location.origin;

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/api/products`,
  adminLogin: `${API_BASE_URL}/api/admin/login`,
  health: `${API_BASE_URL}/api/health`
};

export default API_BASE_URL;