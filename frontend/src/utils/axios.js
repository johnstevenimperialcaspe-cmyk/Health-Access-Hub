// frontend/src/utils/axios.js
// Centralized axios configuration with automatic token injection
import axios from "axios";

// Detect if we're accessing from external device (not localhost)
const isExternalAccess = !window.location.hostname.includes('localhost') && 
                        !window.location.hostname.includes('127.0.0.1');

// Detect if we're in GitHub Codespaces
const isCodespaces = window.location.hostname.includes('app.github.dev') || 
                     window.location.hostname.includes('github.dev');

// Determine the base URL for API calls
let baseURL = "";

// IMPORTANT: In Codespaces, use empty baseURL to leverage the proxy
// This avoids CORS issues by routing through the same origin (port 3000)
if (isCodespaces) {
  // Use the proxy - all /api calls will be forwarded to localhost:5000
  baseURL = "";
  console.log("🔧 Using proxy for API calls (Codespaces mode)");
} else if (isExternalAccess) {
  // If accessing from external device (same network), use the same protocol and host but port 5000
  const protocol = window.location.protocol;
  baseURL = `${protocol}//${window.location.hostname}:5000`;
}
// Otherwise, use empty baseURL and let proxy handle it (for localhost)

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

