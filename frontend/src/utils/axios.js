// frontend/src/utils/axios.js
// Centralized axios configuration with automatic token injection
import axios from "axios";

// Detect if we're accessing from external device (not localhost)
const isExternalAccess = !window.location.hostname.includes('localhost') && 
                        !window.location.hostname.includes('127.0.0.1');

// If accessing from external device, use the same host but port 5000
// Otherwise, use empty baseURL and let proxy handle it
const baseURL = isExternalAccess 
  ? `http://${window.location.hostname}:5000`
  : "";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
});

// Request interceptor to attach auth token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("authToken");
    
    // If token exists, attach it to the request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      delete api.defaults.headers.common["Authorization"];
      
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

