/**
 * Travelsofaka (TripMate) Theme Colors
 * Extracted directly from travelsofaka_ui.html specification
 */

export const palette = {
  // Primary Teal Palette
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488', // Main Brand Primary
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Secondary Coral Palette
  coral: {
    50: '#FFF5F5',
    100: '#FFE3E3',
    200: '#FFC9C9',
    300: '#FFA8A8',
    400: '#FF8787',
    500: '#FF6B6B', // Main Brand Secondary / Action
    600: '#FA5252',
    700: '#E03131',
    800: '#C92A2A',
  },

  // Neutral Slate Palette
  slate: {
    50: '#F8FAFC',  // Screen Background
    100: '#F1F5F9', // Card / Element border light
    200: '#E2E8F0', // Input border
    300: '#CBD5E1',
    400: '#94A3B8', // Placeholder / Subtitle
    500: '#64748B', // Secondary text
    600: '#475569', // Body text
    700: '#334155', // Title text
    800: '#1E293B', // Dark artboard background
    900: '#0F172A', // Heavy text / Dark mode
    950: '#020617', // Scanner dark background
  },

  // Functional Accents
  amber: {
    500: '#F59E0B', // Star Rating & Badges
  },
  emerald: {
    500: '#10B981', // Success / Verified
  },
  rose: {
    500: '#F43F5E', // Error / Delete
  },
  common: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
};

export const themeColors = {
  // Light Mode Theme (Default)
  light: {
    primary: palette.teal[600],
    primaryLight: palette.teal[50],
    primaryBorder: palette.teal[200],
    primaryDark: palette.teal[700],

    secondary: palette.coral[500],
    secondaryLight: palette.coral[50],
    secondaryDark: palette.coral[600],

    background: palette.slate[50],
    surface: palette.common.white,
    card: palette.common.white,

    border: palette.slate[200],
    borderLight: palette.slate[100],

    text: palette.slate[900],
    textSecondary: palette.slate[600],
    textMuted: palette.slate[400],

    rating: palette.amber[500],
    success: palette.emerald[500],
    danger: palette.rose[500],

    scannerBg: palette.slate[950],
  },

  // Dark Mode Theme
  dark: {
    primary: palette.teal[500],
    primaryLight: palette.teal[900],
    primaryBorder: palette.teal[700],
    primaryDark: palette.teal[400],

    secondary: palette.coral[500],
    secondaryLight: '#3B1A1A',
    secondaryDark: palette.coral[400],

    background: palette.slate[900],
    surface: palette.slate[800],
    card: palette.slate[800],

    border: palette.slate[700],
    borderLight: palette.slate[800],

    text: palette.slate[50],
    textSecondary: palette.slate[300],
    textMuted: palette.slate[500],

    rating: palette.amber[500],
    success: palette.emerald[500],
    danger: palette.rose[500],

    scannerBg: palette.common.black,
  },
};
