/**
 * 1000Banks App Color Palette
 * Based on the dark-themed fintech design inspiration
 */

import { useColorScheme } from 'react-native';

const primaryGold = '#F5B800';
const successGreen = '#10B981';
const errorRed = '#EF4444';

// Light theme colors
const lightColors = {
  background: {
    default: '#FFFFFF',
    card: '#F3F4F6',
    highlight: '#F9FAFB',
    dark: '#1F2937', // For contrast elements in light mode
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
  },
  border: '#E5E7EB',
};

// Dark theme colors
const darkColors = {
  background: {
    default: '#000000',
    card: '#1A1A1A',
    highlight: '#2A2A2A',
    dark: '#000000',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    inverse: '#111827',
  },
  border: '#374151',
};

export const Colors = {
  light: {
    text: lightColors.text.primary,
    background: lightColors.background.default,
    tint: primaryGold,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryGold,
    card: lightColors.background.card,
    border: lightColors.border,
    primary: primaryGold,
    success: successGreen,
    error: errorRed,
  },
  dark: {
    text: darkColors.text.primary,
    background: darkColors.background.default,
    tint: primaryGold,
    icon: darkColors.text.secondary,
    tabIconDefault: darkColors.text.secondary,
    tabIconSelected: primaryGold,
    card: darkColors.background.card,
    border: darkColors.border,
    primary: primaryGold,
    success: successGreen,
    error: errorRed,
  },
};

// Hook to get theme-aware colors
export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    primary: primaryGold,
    background: isDark ? darkColors.background : lightColors.background,
    text: isDark ? darkColors.text : lightColors.text,
    success: successGreen,
    error: errorRed,
    border: isDark ? darkColors.border : lightColors.border,
    accent: {
      success: successGreen,
      error: errorRed,
    },
    isDark,
  };
};

// Legacy export for backward compatibility - defaults to dark theme
export const AppColors = {
  primary: primaryGold,
  background: darkColors.background,
  text: darkColors.text,
  success: successGreen,
  error: errorRed,
  border: darkColors.border,
  accent: {
    success: successGreen,
    error: errorRed,
  },
};
