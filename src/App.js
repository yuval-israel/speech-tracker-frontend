import React, { useState, useEffect, useCallback } from 'react';
import { Platform, I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Colors, ThemeProvider, useTheme } from './theme';
import Navigation from './navigation/Navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setOnUnauthorized, API_BASE } from './api';
import offlineQueue from './services/offlineQueue';

// Initialize offline queue to start syncing when connectivity is restored
offlineQueue.init();

// Force RTL
try {
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
    // Updates to I18nManager need a restart in some cases, but we set it early
  }
} catch (e) {
  console.error('RTL Error', e);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { token, isLoading: authLoading, signOut, hasConfiguredFamily, setHasConfiguredFamily } = useAuth();
  const { isDark, colors } = useTheme();
  const [isCheckingFamily, setIsCheckingFamily] = useState(true);

  // Check for existing children on token change
  useEffect(() => {
    const checkForChildren = async () => {
      if (!token) {
        setIsCheckingFamily(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/children/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const children = await response.json();
          if (children && children.length > 0) {
            setHasConfiguredFamily(true);
          }
        }
      } catch (error) {
        console.error('Failed to check for children:', error);
      } finally {
        setIsCheckingFamily(false);
      }
    };

    checkForChildren();
  }, [token, setHasConfiguredFamily]);

  useEffect(() => {
    if (!authLoading && !isCheckingFamily) {
      SplashScreen.hideAsync();
    }
  }, [authLoading, isCheckingFamily]);

  useEffect(() => {
    setOnUnauthorized(signOut);
    return () => setOnUnauthorized(null);
  }, [signOut]);

  const isLoading = authLoading || isCheckingFamily;

  return (
    <>
      <Navigation
        isAuthenticated={!!token}
        hasConfiguredFamily={hasConfiguredFamily}
        isLoading={isLoading}
      />
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
