import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { API_BASE, apiJson } from '../api';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';

export default function RegisterScreen({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    // Client-side validation
    if (!username || !password) {
      setError('Please enter a username and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    try {
      setLoading(true);
      // Register new user via apiJson to capture backend validation messages
      try {
        await apiJson('/users/', null, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
      } catch (err) {
        // show backend validation errors
        setError(err && err.message ? err.message : 'Registration failed');
        setLoading(false);
        return;
      }
      // Registration successful, auto-login the user
      try {
        const bodyData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        const loginRes = await fetch(`${API_BASE}/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: bodyData
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          const token = loginData.access_token;
          onRegisterSuccess(token);
        } else {
          onRegisterSuccess(null);
        }
      } catch (e) {
        onRegisterSuccess(null);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Choose a username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Choose a password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.registerRow}>
        <PrimaryButton title="Sign Up" onPress={handleRegister} disabled={loading} />
        {loading ? <LoadingIndicator size="small" text="Creating account…" /> : null}
      </View>
      <View style={styles.switchContainer}>
        <Text>Already have an account?</Text>
        <PrimaryButton title="Log In" onPress={onSwitchToLogin} style={{ marginTop: 8, backgroundColor: '#fff' }} textStyle={{ color: '#2563EB' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center'
  },
  switchContainer: {
    marginTop: 16,
    alignItems: 'center'
  }
});
