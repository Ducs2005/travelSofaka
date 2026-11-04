import { TextStyle, Platform } from 'react-native';

export const fontFamilies = {
  regular: Platform.select({
    ios: 'PlusJakartaSans-Regular',
    android: 'PlusJakartaSans-Regular',
    default: 'sans-serif',
  }),
  medium: Platform.select({
    ios: 'PlusJakartaSans-Medium',
    android: 'PlusJakartaSans-Medium',
    default: 'sans-serif-medium',
  }),
  semibold: Platform.select({
    ios: 'PlusJakartaSans-SemiBold',
    android: 'PlusJakartaSans-SemiBold',
    default: 'sans-serif',
  }),
  bold: Platform.select({
    ios: 'PlusJakartaSans-Bold',
    android: 'PlusJakartaSans-Bold',
    default: 'sans-serif-bold',
  }),
  extrabold: Platform.select({
    ios: 'PlusJakartaSans-ExtraBold',
    android: 'PlusJakartaSans-ExtraBold',
    default: 'sans-serif-bold',
  }),
};

export const typography = {
  fontSizes: {
    '2xs': 10,
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  lineHeights: {
    '2xs': 14,
    xs: 16,
    sm: 18,
    base: 20,
    md: 24,
    lg: 26,
    xl: 28,
    '2xl': 32,
    '3xl': 38,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};
