// Color theme matching frontend-v2
export const colors = {
  leaf: '#2d5016',
  leafLight: '#4a7c2c',
  leafDark: '#1a3009',
  sage: '#87a878',
  sageLight: '#b4d4a5',
  moss: '#5f7c4d',
  cream: '#faf8f3',
  sand: '#e8dfd0',
  earth: '#8b7355',
  sky: '#a8c5dd',
  warning: '#d87941',
  danger: '#c14543',
  beige: '#faf8f3',
  forest: '#2d5016',
  forestDark: '#1a3009',
  olive: '#87a878',
  oliveLight: '#b4d4a5',
  oliveDark: '#5f7c4d',
  hazard: '#c14543',
  white: '#ffffff',
  black: '#000000',
};

export const gradients = {
  primary: ['#4a7c2c', '#2d5016'],
  secondary: ['#87a878', '#5f7c4d'],
  warning: ['#d87941', '#c14543'],
  background: ['#faf8f3', '#e8dfd0'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 999,
};

export const shadows = {
  small: {
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.forest,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.forest,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.forest,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.forest,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.forest,
  },
  body: {
    fontSize: 16,
    color: colors.moss,
  },
  bodyLarge: {
    fontSize: 18,
    color: colors.moss,
  },
  caption: {
    fontSize: 14,
    color: colors.oliveDark,
  },
  small: {
    fontSize: 12,
    color: colors.oliveDark,
  },
};
