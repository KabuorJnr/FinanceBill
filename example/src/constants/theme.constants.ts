export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#0A0A0A',
  textSecondary: '#3C3C43',
  textMuted: '#8E8E93',
  border: 'rgba(0, 0, 0, 0.08)',
  shadow: '#000000',
  brand: '#FF6A00',
  brandDeep: '#FF3D00',
  brandLight: '#FF8A1F',
  inverse: '#FFFFFF',
  like: '#FF2D55',
} as const;

export const glassTints = {
  neutral: 'rgba(255, 255, 255, 0.12)',
  accent: 'rgba(255, 92, 0, 0.62)',
} as const;

export const fonts = {
  regular: 'rounded-regular',
  medium: 'rounded-medium',
  bold: 'rounded-bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 28,
  pill: 999,
} as const;

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  raised: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;
