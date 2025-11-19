import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { API_BASE } from '../api';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';

export default function LoginScreen({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    try {
      setLoading(true);
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
        setLoading(false);
      } else {
        const data = await response.json();
        const token = data.access_token;
        if (token) {
          onLogin(token);
          setLoading(false);
        } else {
          setError('Unexpected response from server.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
      setLoading(false);
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
      <View style={styles.loginRow}>
        <PrimaryButton title="Log In" onPress={handleLogin} disabled={loading} />
        {loading ? <LoadingIndicator size="small" text="Logging in…" /> : null}
      </View>
      <View style={styles.switchContainer}>
        <Text>Don't have an account?</Text>
        <PrimaryButton title="Sign Up" onPress={onSwitchToRegister} style={{ marginTop: 8, backgroundColor: '#fff' }} textStyle={{ color: '#2563EB' }} />
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
  ,
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loading: {
    marginLeft: 12
  }
});
