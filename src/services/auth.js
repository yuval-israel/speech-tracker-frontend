import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default { getToken, setToken, clearToken };
