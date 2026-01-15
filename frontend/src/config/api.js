// API Configuration for production and development
// Automatically detect the environment and set appropriate API URL
const getApiBaseUrl = () => {
    // If environment variable is set, use it
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // In browser context
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // GitHub Codespaces detection
        if (hostname.includes('app.github.dev') || hostname.includes('github.dev')) {
            // Replace port 3000 with 5000 in the hostname
            const backendHostname = hostname.replace(/-3000\./, '-5000.');
            return `https://${backendHostname}`;
        }
        
        // Local network (non-localhost)
        if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
            const protocol = window.location.protocol;
            return `${protocol}//${hostname}:5000`;
        }
    }
    
    // Default to localhost for development
    return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Build a complete API URL from an endpoint
 * @param {string} endpoint - API endpoint (e.g., '/api/appointments')
 * @returns {string} Complete URL
 */
export const buildApiUrl = (endpoint) => {
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Build a complete media URL from a path
 * @param {string} path - Media path
 * @returns {string} Complete URL
 */
export const buildMediaUrl = (path) => {
    if (!path) return '';
    // If path is already a full URL, return it
    if (path.startsWith('http')) return path;
    // Otherwise, build the full URL
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export default API_BASE_URL;
