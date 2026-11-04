export const spacing = {
  none: 0,
  '2xs': 2,
  xs: 4,
  sm: 6,
  md: 8,
  base: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 48,
};

export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12, // rounded-xl
  lg: 16, // rounded-2xl
  xl: 20,
  '2xl': 24, // rounded-3xl
  '3xl': 32, // screen radius: 36px in UI
  full: 9999, // pill
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
  },
};
