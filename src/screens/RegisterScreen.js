import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { API_BASE } from '../api';

export default function RegisterScreen({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter a username and password.');
      return;
    }
    try {
      // Register new user
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const detail = data.detail || 'Registration failed';
        setError(detail);
      } else {
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
            // If login immediately after registration fails
            onRegisterSuccess(null);
          }
        } catch {
          onRegisterSuccess(null);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
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
      <Button title="Sign Up" onPress={handleRegister} />
      <View style={styles.switchContainer}>
        <Text>Already have an account?</Text>
        <Button title="Log In" onPress={onSwitchToLogin} />
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
