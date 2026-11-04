import { palette, themeColors } from './colors';
import { typography, fontFamilies } from './typography';
import { spacing, radii, shadows } from './spacing';

export const AppTheme = {
  palette,
  colors: themeColors.light,
  darkColors: themeColors.dark,
  typography,
  fontFamilies,
  spacing,
  radii,
  shadows,
};

export type ThemeType = typeof AppTheme;
export * from './colors';
export * from './typography';
export * from './spacing';
export default AppTheme;
