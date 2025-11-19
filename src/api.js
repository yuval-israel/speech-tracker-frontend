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
    // If unauthorized, allow app to react (logout) via a registered handler
    if (response.status === 401 && typeof onUnauthorizedCallback === 'function') {
      try {
        onUnauthorizedCallback();
      } catch (err) {
        console.error('onUnauthorized callback error', err);
      }
    }
    return response;
  } catch (error) {
    console.error('Network error during fetch', error);
    throw error;
  }
}

// Internal hook for notifying app about 401 / unauthorized events
let onUnauthorizedCallback = null;

/**
 * Register a handler to be called when a 401 Unauthorized response is seen.
 * Pass `null` to clear the handler.
 */
export function setOnUnauthorized(handler) {
  if (handler && typeof handler !== 'function') throw new Error('handler must be a function or null');
  onUnauthorizedCallback = handler;
}

/**
 * Convenience helper: perform authFetch and parse JSON, throwing a Error
 * with backend message on non-OK responses. If a 401 is encountered the
 * registered onUnauthorized handler will already be invoked by authFetch.
 */
export async function apiJson(path, token, options = {}) {
  const res = await authFetch(path, token, options);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // no json body
    data = null;
  }
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || `Request failed with status ${res.status}`;
    const err = new Error(detail);
    err.status = res.status;
    err.response = res;
    err.data = data;
    throw err;
  }
  return data;
}
