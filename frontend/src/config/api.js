// API Configuration for production and development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
