import { playgroundColors } from '../tray-playground/playground.theme';

// Taken from the Kenyan flag: black, red, green, with white fimbriation.
export const safiriColors = {
  ...playgroundColors,
  green: '#006B3F',
  greenTint: 'rgba(0, 107, 63, 0.12)',
  red: '#BB0000',
  redTint: 'rgba(187, 0, 0, 0.1)',
  black: '#0A0A0A',
  star: '#F5A524',
  route: '#006B3F',
  routeShadow: 'rgba(0, 107, 63, 0.25)',
} as const;

export const SAFIRI_TRAY_CONTENT = {
  backgroundColor: safiriColors.background,
  cornerRadius: 40,
} as const;

export const SAFIRI_MAP_PADDING = {
  top: 120,
  right: 40,
  bottom: 260,
  left: 40,
};
