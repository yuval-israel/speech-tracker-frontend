import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth';
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
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      // Register new user
      await authService.register(username.trim(), password);

      // Auto-login after successful registration
      try {
        const loginResponse = await authService.login(username.trim(), password);
        await signIn(loginResponse.access_token);
        // Navigation is handled by auth state change
      } catch (loginErr) {
        // If auto-login fails, redirect to login screen
        console.error('Auto-login failed after registration:', loginErr);
        navigation.navigate('Login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
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
