import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Colors = {
  primary: '#2563EB', // blue-600
  primaryDark: '#1D4ED8',
  secondary: '#F59E0B', // amber-500
  text: '#111827',
  textLight: '#6B7280',
  muted: '#9CA3AF',
  background: '#FFFFFF',
  surface: '#F3F4F6',
  danger: '#DC2626',
  success: '#10B981',
  border: '#E5E7EB',
  divider: '#E5E7EB',
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
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  STATUS_BAR_HEIGHT: 36, // Fixed value from specs
  TOP_NAV_HEIGHT: 68,
  BOTTOM_NAV_HEIGHT: 90,
  HEADER_EXPANDED_HEIGHT: 148,
  SECTION_PADDING: 16,
  CONTENT_PADDING: 12,
  TITLE_PADDING: 20,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
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
