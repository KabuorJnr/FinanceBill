import type { TextStyle } from 'react-native';
import type { TrayAnimationPreset } from 'morphlet';

import { fonts } from '../../constants';

export const playgroundColors = {
  background: '#FFFFFF',
  text: '#0A0A0A',
  textSecondary: '#3C3C43',
  label: '#8E8E93',
  accent: '#0A84FF',
  accentTint: 'rgba(10, 132, 255, 0.12)',
  danger: '#FF3B30',
  dangerTint: 'rgba(255, 59, 48, 0.1)',
  success: '#34C759',
  card: '#F5F5F7',
  cardPressed: '#ECECEF',
  separator: 'rgba(0, 0, 0, 0.06)',
  inverse: '#FFFFFF',
} as const;

function rounded(
  fontFamily: string,
  fontSize: number,
  extra?: TextStyle
): TextStyle {
  return { fontFamily, fontSize, includeFontPadding: false, ...extra };
}

export const playgroundType = {
  display: rounded(fonts.bold, 40, { letterSpacing: -0.6 }),
  title: rounded(fonts.bold, 25),
  heading: rounded(fonts.bold, 24, { letterSpacing: -0.2 }),
  body: rounded(fonts.regular, 16, { lineHeight: 22 }),
  label: rounded(fonts.regular, 16),
  value: rounded(fonts.medium, 16),
  button: rounded(fonts.bold, 18),
  caption: rounded(fonts.regular, 14),
} as const;

export const SPRINGS: { value: TrayAnimationPreset; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'snappy', label: 'Snappy' },
  { value: 'bouncy', label: 'Bouncy' },
];

export const SPEEDS: { value: number; label: string }[] = [
  { value: 0.25, label: '0.25s' },
  { value: 0.5, label: '0.5s' },
  { value: 1, label: '1s' },
  { value: 2, label: '2s' },
];

export interface IPlaygroundSettings {
  spring: TrayAnimationPreset;
  duration: number;
}

export const DEFAULT_SETTINGS: IPlaygroundSettings = {
  spring: 'default',
  duration: 0.25,
};

export const TRAY_CONTENT = {
  backgroundColor: playgroundColors.background,
  cornerRadius: 40,
} as const;
