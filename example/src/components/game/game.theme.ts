import type { TextStyle } from 'react-native';

export const gameColors = {
  background: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.56)',
  textTertiary: 'rgba(255, 255, 255, 0.36)',
  surface: '#262626',
  surfacePressed: '#2F2F2F',
  pill: 'rgba(255, 255, 255, 0.07)',
  border: 'rgba(255, 255, 255, 0.1)',
  star: '#F5A524',
  starEmpty: 'rgba(255, 255, 255, 0.16)',
  like: '#FF375F',
  play: '#FFFFFF',
  playLabel: '#000000',
  remixLabel: 'rgba(255, 255, 255, 0.72)',
  sheet: '#1F1F1F',
} as const;

export const gameLayout = {
  gutter: 24,
  avatar: 116,
  pillHeight: 40,
  galleryRadius: 30,
  cardRadius: 26,
  actionHeight: 64,
} as const;

export const gameType = {
  title: { fontSize: 26, fontWeight: '700', color: gameColors.text },
  body: { fontSize: 16, lineHeight: 23, color: gameColors.textSecondary },
  section: { fontSize: 17, color: gameColors.textSecondary },
  label: { fontSize: 16, fontWeight: '500', color: gameColors.text },
} as const satisfies Record<string, TextStyle>;

export function formatCount(value: number, unit: 'K' | 'k' = 'k'): string {
  if (value < 1000) return String(value);
  const thousands = value / 1000;
  return `${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1)}${unit}`;
}
