import React, { useState, useEffect, useCallback } from 'react';
import { Platform, I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from './theme';
import Navigation from './navigation/Navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setOnUnauthorized, API_BASE } from './api';

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
  const { token, isLoading: authLoading, signOut } = useAuth();
  const [hasConfiguredFamily, setHasConfiguredFamily] = useState(false);
  const [isCheckingFamily, setIsCheckingFamily] = useState(true);

  useEffect(() => {
    const checkForChildren = async () => {
      if (!token) {
        setIsCheckingFamily(false);
        setHasConfiguredFamily(false);
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
          setHasConfiguredFamily(children && children.length > 0);
        } else {
          setHasConfiguredFamily(false);
        }
      } catch (error) {
        console.error('Failed to check for children:', error);
        setHasConfiguredFamily(false);
      } finally {
        setIsCheckingFamily(false);
      }
    };

    checkForChildren();
  }, [token]);

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
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} backgroundColor={Colors.background} />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
