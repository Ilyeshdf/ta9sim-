// Premium Color Palette - Human-Centric Design
export const lightColors = {
  // Primary - Warm Indigo
  primary: '#5B4BDB',
  primaryLight: '#8B7CF6',
  primaryDark: '#4338CA',
  primaryMuted: '#EEF0FF',
  
  // Accent colors - Softer, more organic
  blue: '#4F8FEC',
  blueLight: '#7AB3FF',
  blueMuted: '#EBF4FF',
  green: '#22C997',
  greenLight: '#5CEBBB',
  greenMuted: '#ECFDF5',
  orange: '#F5A623',
  orangeLight: '#FFD07A',
  orangeMuted: '#FFFBEB',
  purple: '#9061F9',
  purpleLight: '#B794F4',
  purpleMuted: '#F3EDFF',
  pink: '#E84393',
  coral: '#FF7F7F',
  teal: '#38B2AC',
  
  // Neutrals - Warmer grays
  white: '#FFFFFF',
  black: '#1A1A2E',
  gray50: '#FAFBFC',
  gray100: '#F4F5F7',
  gray200: '#E8EAED',
  gray300: '#D3D6DB',
  gray400: '#9AA1B0',
  gray500: '#6B7489',
  gray600: '#4A5568',
  gray700: '#2D3748',
  gray800: '#1A202C',
  gray900: '#0F1419',
  
  // Category colors - Rich, distinguishable
  academics: '#4F8FEC',
  wellness: '#22C997',
  work: '#9061F9',
  social: '#F5A623',
  
  // Status colors
  success: '#22C997',
  warning: '#F5A623',
  error: '#F56565',
  
  // Text - Better contrast & warmth
  textPrimary: '#1A1A2E',
  textSecondary: '#5A6178',
  textTertiary: '#9AA1B0',
  textInverse: '#FFFFFF',
  
  // Background - Subtle warmth
  background: '#F8F9FC',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F0F2F5',
  card: '#FFFFFF',
  cardAlt: '#FAFBFD',
  
  // Gradients (start/end pairs)
  gradientPrimary: ['#5B4BDB', '#8B7CF6'],
  gradientSuccess: ['#22C997', '#5CEBBB'],
  gradientWarm: ['#F5A623', '#FFD07A'],
};

// Default export (light mode)
export const colors = lightColors;

const tintColorLight = lightColors.primary;

export default {
  light: {
    text: lightColors.textPrimary,
    background: lightColors.background,
    tint: tintColorLight,
    tabIconDefault: lightColors.gray400,
    tabIconSelected: tintColorLight,
  },
};
