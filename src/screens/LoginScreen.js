import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { API_BASE } from '../api';

export default function LoginScreen({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    try {
      const bodyData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      const response = await fetch(`${API_BASE}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const detail = data.detail || 'Login failed';
        setError(detail);
      } else {
        const data = await response.json();
        const token = data.access_token;
        if (token) {
          onLogin(token);
        } else {
          setError('Unexpected response from server.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Log In" onPress={handleLogin} />
      <View style={styles.switchContainer}>
        <Text>Don't have an account?</Text>
        <Button title="Sign Up" onPress={onSwitchToRegister} />
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
