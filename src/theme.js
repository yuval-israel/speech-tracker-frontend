import { Dimensions, Platform } from 'react-native';

export const Colors = {
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

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'left', // Will be handled by RTL logic
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'left',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'left',
  },
  body: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'left',
  },
  small: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'left',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'left',
  }
};

export const Layout = {
  STATUS_BAR_HEIGHT: 36, // Fixed value from specs
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
};

export default { Colors, Spacing, Typography, Layout, Shadows };
