/**
 * 1000Banks App Color Palette
 * Based on the dark-themed fintech design inspiration
 */

const primaryGold = '#F5B800';
const backgroundDark = '#000000';
const cardDark = '#1A1A1A';
const textPrimary = '#FFFFFF';
const textSecondary = '#9CA3AF';
const successGreen = '#10B981';
const errorRed = '#EF4444';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: primaryGold,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryGold,
    card: '#F9FAFB',
    border: '#E5E7EB',
    primary: primaryGold,
    success: successGreen,
    error: errorRed,
  },
  dark: {
    text: textPrimary,
    background: backgroundDark,
    tint: primaryGold,
    icon: textSecondary,
    tabIconDefault: textSecondary,
    tabIconSelected: primaryGold,
    card: cardDark,
    border: '#374151',
    primary: primaryGold,
    success: successGreen,
    error: errorRed,
  },
};

// Additional theme colors for consistency
export const AppColors = {
  primary: primaryGold,
  background: {
    dark: backgroundDark,
    card: cardDark,
  },
  text: {
    primary: textPrimary,
    secondary: textSecondary,
  },
  success: successGreen,
  error: errorRed,
  accent: {
    success: successGreen,
    error: errorRed,
  },
};
