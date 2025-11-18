import { Platform } from 'react-native';

export const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000'
  : 'http://localhost:8000';

/**
 * Helper to perform a fetch request with an Authorization header.
 * @param {string} path - The API path (starting with '/').
 * @param {string} token - The authentication token (if any).
 * @param {object} options - Additional fetch options (method, headers, body, etc.).
 * @returns {Promise<Response>} The fetch response promise.
 */
export async function authFetch(path, token, options = {}) {
  const url = API_BASE + path;
  const headers = options.headers ? { ...options.headers } : {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(url, { ...options, headers });
    return response;
  } catch (error) {
    console.error('Network error during fetch', error);
    throw error;
  }
}
