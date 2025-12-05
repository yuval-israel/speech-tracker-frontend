import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Platform } from 'react-native';

const THEME_STORAGE_KEY = 'APP_THEME';

// Light theme colors
const LightColors = {
  primary: '#5A8FBB',
  primaryLight: '#DCEBF5',
  primaryDark: '#2C4A60',
  background: '#F4F7F9',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#2C4A60',
  textLight: '#8FA3B0',
  muted: '#8FA3B0',
  success: '#81C784',
  danger: '#E57373',
  warning: '#FFB74D',
  border: '#E1E8ED',
  divider: '#E1E8ED',
  white: '#FFFFFF',
  black: '#000000',
};

// Dark theme colors
const DarkColors = {
  primary: '#7AAFDB',
  primaryLight: '#2C4A60',
  primaryDark: '#DCEBF5',
  background: '#1A1A2E',
  card: '#16213E',
  surface: '#16213E',
  text: '#EAEAEA',
  textLight: '#A0A0A0',
  muted: '#6B6B6B',
  success: '#81C784',
  danger: '#E57373',
  warning: '#FFB74D',
  border: '#2A2A4A',
  divider: '#2A2A4A',
  white: '#FFFFFF',
  black: '#000000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Layout = {
  STATUS_BAR_HEIGHT: 36,
  TOP_NAV_HEIGHT: 68,
  BOTTOM_NAV_HEIGHT: 80,
  HEADER_EXPANDED_HEIGHT: 148,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
    round: 9999,
  }
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
};

const ThemeContext = createContext({
  isDark: false,
  colors: LightColors,
  toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark') {
          setIsDark(true);
        }
      } catch (err) {
        console.error('Failed to load theme:', err);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light');
    } catch (err) {
      console.error('Failed to save theme:', err);
    }
  }, [isDark]);

  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export current colors (for backward compatibility)
export const Colors = LightColors;

// Typography factory that works with theme colors
export const getTypography = (colors) => ({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'left',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'left',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'left',
  },
  body: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'left',
  },
  small: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'left',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'left',
  }
});

export const Typography = getTypography(LightColors);

export default { Colors, Spacing, Typography, Layout, Shadows, LightColors, DarkColors };
