import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE } from '../api';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Typography } from '../theme';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          await signIn(token);
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
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" align="center" style={styles.title}>Speech Tracker</Text>

        {/* Social Login Placeholders */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Text>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text>F</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <Text variant="label">Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text variant="label">Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Enter your password"
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
            title="Log In"
            onPress={handleLogin}
            disabled={loading}
            style={styles.button}
          />

          {loading ? <LoadingIndicator size="small" text="Logging in…" /> : null}
        </View>

        <View style={styles.footer}>
          <Text align="center">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text color={Colors.primary} align="center" style={styles.link}>Sign Up</Text>
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textLight,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
