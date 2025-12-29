import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../api';

const TOKEN_KEY = 'ST_ACCESS_TOKEN';

export async function getToken() {
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return t;
  } catch (err) {
    console.error('Failed to read token from storage', err);
    return null;
  }
}

export async function setToken(token) {
  try {
    if (!token) return;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to save token to storage', err);
  }
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to remove token from storage', err);
  }
}

/**
 * Login with username and password.
 * Backend expects OAuth2PasswordRequestForm (form-data format).
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function login(username, password) {
  // Backend expects OAuth2PasswordRequestForm format (form-data)
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_BASE}/auth/token`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }

  const data = await response.json();
  return data; // { access_token, token_type }
}

/**
 * Register a new user.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{id: number, username: string, created_at: string, role: string}>}
 */
export async function register(username, password) {
  const response = await fetch(`${API_BASE}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Registration failed');
  }

  const data = await response.json();
  return data; // { id, username, created_at, role }
}

export default { getToken, setToken, clearToken, login, register };
