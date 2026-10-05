import type { TextStyle } from 'react-native';

import { fonts } from '../../constants';

export const collectionColors = {
  background: '#F2F3F5',
  surface: '#FFFFFF',
  text: '#0B0B0C',
  textSecondary: '#6B6E76',
  textTertiary: '#A1A4AB',
  separator: 'rgba(0, 0, 0, 0.07)',
  field: '#F2F3F5',
  fieldPressed: '#E8E9EC',
  accent: '#1A62D8',
  fab: '#0B0B0C',
  badge: '#FF3B30',
  photoBorder: '#FFFFFF',
  sheet: '#FFFFFF',
} as const;

export const collectionGlass = {
  light: 'rgba(255, 255, 255, 0.42)',
  dark: 'rgba(10, 10, 12, 0.82)',
} as const;

export const FOLDER_TINTS = [
  '#F28B95',
  '#8E9BF5',
  '#7CCFA8',
  '#F5B85C',
  '#B78CF0',
] as const;

export const collectionLayout = {
  gutter: 24,
  folderRadius: 30,
  folderAspect: 0.49,
  buttonSize: 44,
  fabSize: 58,
  barHeight: 58,
} as const;

export const collectionType = {
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: collectionColors.text,
  },
  title: { fontFamily: fonts.bold, fontSize: 24, color: collectionColors.text },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: collectionColors.textSecondary,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 17,
    color: collectionColors.text,
  },
  button: { fontFamily: fonts.bold, fontSize: 17, color: '#FFFFFF' },
} as const satisfies Record<string, TextStyle>;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatCollectionDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
