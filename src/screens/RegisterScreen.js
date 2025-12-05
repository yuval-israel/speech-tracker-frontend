import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE, apiJson } from '../api';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Typography } from '../theme';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          await signIn(token);
        } else {
          // If auto-login fails, redirect to login
          navigation.navigate('Login');
        }
      } catch (e) {
        navigation.navigate('Login');
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
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" align="center" style={styles.title}>Create Account</Text>

        <View style={styles.form}>
          <Text variant="label">Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text variant="label">Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Choose a password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            title="Sign Up"
            onPress={handleRegister}
            disabled={loading}
            style={styles.button}
          />

          {loading ? <LoadingIndicator size="small" text="Creating account…" /> : null}
        </View>

        <View style={styles.footer}>
          <Text align="center">Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text color={Colors.primary} align="center" style={styles.link}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xl,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
    textAlign: 'left',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: 12,
    zIndex: 1,
  },
  error: {
    color: Colors.danger,
    marginBottom: Spacing.md,
    textAlign: 'center'
  },
  button: {
    marginTop: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  link: {
    fontWeight: '600',
    marginTop: Spacing.xs,
  }
});
