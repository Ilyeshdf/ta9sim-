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

// Dark Mode Colors
export const darkColors = {
  // Primary - Warm Indigo (slightly lighter for dark mode)
  primary: '#7B6BFB',
  primaryLight: '#A99CFF',
  primaryDark: '#5B4BDB',
  primaryMuted: '#2A2640',
  
  // Accent colors
  blue: '#5A9FFF',
  blueLight: '#8AC3FF',
  blueMuted: '#1A2A40',
  green: '#32D9A7',
  greenLight: '#6CFFCB',
  greenMuted: '#1A3A30',
  orange: '#FFB633',
  orangeLight: '#FFD88A',
  orangeMuted: '#3A2A15',
  purple: '#A071FF',
  purpleLight: '#C7A4FF',
  purpleMuted: '#2A1A40',
  pink: '#FF5AAC',
  coral: '#FF9F9F',
  teal: '#48C2BC',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#0A0A15',
  gray50: '#18181F',
  gray100: '#1E1E28',
  gray200: '#2A2A38',
  gray300: '#3A3A4A',
  gray400: '#6A6A7A',
  gray500: '#8A8A9A',
  gray600: '#A0A0B0',
  gray700: '#C0C0D0',
  gray800: '#E0E0F0',
  gray900: '#F0F0FF',
  
  // Category colors
  academics: '#5A9FFF',
  wellness: '#32D9A7',
  work: '#A071FF',
  social: '#FFB633',
  
  // Status colors
  success: '#32D9A7',
  warning: '#FFB633',
  error: '#FF6B6B',
  
  // Text
  textPrimary: '#F0F0FF',
  textSecondary: '#A0A0B8',
  textTertiary: '#6A6A7A',
  textInverse: '#1A1A2E',
  
  // Background
  background: '#0F0F18',
  backgroundSecondary: '#18181F',
  backgroundTertiary: '#1E1E28',
  card: '#1A1A25',
  cardAlt: '#22222E',
  
  // Gradients
  gradientPrimary: ['#7B6BFB', '#A99CFF'],
  gradientSuccess: ['#32D9A7', '#6CFFCB'],
  gradientWarm: ['#FFB633', '#FFD88A'],
};

// Default export (light mode)
export const colors = lightColors;

const tintColorLight = lightColors.primary;
const tintColorDark = darkColors.primary;

export default {
  light: {
    text: lightColors.textPrimary,
    background: lightColors.background,
    tint: tintColorLight,
    tabIconDefault: lightColors.gray400,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: darkColors.textPrimary,
    background: darkColors.background,
    tint: tintColorDark,
    tabIconDefault: darkColors.gray400,
    tabIconSelected: tintColorDark,
  },
};
