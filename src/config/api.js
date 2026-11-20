// Centralized API Configuration
// Automatically adapts to localhost in development and live domain in production
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
export default API_BASE_URL;
