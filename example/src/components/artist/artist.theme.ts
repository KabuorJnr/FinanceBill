import type { TextStyle } from 'react-native';
import { sfFont } from '../../utils';

export const artistColors = {
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.62)',
  textTertiary: 'rgba(255, 255, 255, 0.45)',
  card: 'rgba(255, 255, 255, 0.12)',
  cardPressed: 'rgba(255, 255, 255, 0.2)',
  separator: 'rgba(255, 255, 255, 0.14)',
  badge: 'rgba(0, 0, 0, 0.28)',
  play: '#FFFFFF',
  playIcon: '#000000',
  accent: '#FF375F',
  sheet: '#1C1C1E',
  fallbackBackground: '#1C1C1E',
} as const;

export const artistLayout = {
  gutter: 16,
  shelfGap: 12,
  sectionGap: 30,
  rowArtwork: 44,
  cardRadius: 20,
  artworkRadius: 8,
} as const;

export const artistType = {
  sectionTitle: { fontSize: 22, ...sfFont('700'), color: artistColors.text },
  title: { fontSize: 17, ...sfFont('600'), color: artistColors.text },
  body: { ...sfFont(), fontSize: 16, color: artistColors.text },
  caption: { ...sfFont(), fontSize: 13, color: artistColors.textSecondary },
  captionStrong: {
    fontSize: 13,
    ...sfFont('600'),
    color: artistColors.textSecondary,
  },
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

export function formatReleaseDate(date: string | null): string | null {
  const [year, month, day] = date?.split('-').map(Number) ?? [];
  const monthName = month ? MONTHS[month - 1] : undefined;
  if (!year || !monthName || !day) return null;
  return `${day} ${monthName} ${year}`;
}

export function yearOf(date: string | null): number | null {
  const year = Number(date?.slice(0, 4));
  return year > 0 ? year : null;
}

export function joinMeta(...parts: (string | number | null | undefined)[]) {
  return parts
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join(' · ');
}
