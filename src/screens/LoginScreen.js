import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../theme';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTos, setAcceptTos] = useState(false);

  const handleSocialLogin = async (provider) => {
    setError('');
    if (!acceptTos) {
      setError('You must accept the Terms of Service to continue.');
      return;
    }
    // Mock social login – replace with real provider integration later
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      await signIn(`mock-social-token-${provider.toLowerCase()}`);
    } catch (err) {
      console.error('Mock social login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" align="center" style={styles.title}>Speech Tracker</Text>
        <Text variant="body" align="center" color={Colors.textLight} style={styles.subtitle}>
          Track and support your child&apos;s speech in everyday life.
        </Text>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <PrimaryButton
            title="Continue with Google"
            onPress={() => handleSocialLogin('Google')}
            disabled={loading || !acceptTos}
            style={styles.socialButton}
          />
          <PrimaryButton
            title="Continue with Apple"
            onPress={() => handleSocialLogin('Apple')}
            disabled={loading || !acceptTos}
            style={styles.socialButton}
          />
        </View>

        {/* Terms of Service */}
        <TouchableOpacity
          style={styles.tosRow}
          onPress={() => setAcceptTos(!acceptTos)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptTos }}
        >
          <View style={[styles.checkbox, acceptTos && styles.checkboxChecked]}>
            {acceptTos ? <Text color={Colors.card}>✓</Text> : null}
          </View>
          <Text variant="small" style={styles.tosText}>
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? <LoadingIndicator size="small" text="Signing you in…" /> : null}

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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
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
    marginTop: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    width: '100%',
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
  },
  tosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tosText: {
    flex: 1,
  },
});
