import type { MapStyleElement } from 'react-native-maps';

// Colours measured from the reference recording (iOS dark trays with a
// raspberry accent), plus the Kenyan flag for brand moments.
export const tikitiColors = {
  background: '#0A0A0A',
  sheet: '#18181B',
  text: '#FFFFFF',
  textSecondary: 'rgba(235, 235, 245, 0.6)',
  textTertiary: 'rgba(235, 235, 245, 0.3)',
  card: '#2D2D30',
  cardPressed: '#38383C',
  control: '#3A3A3D',
  separator: 'rgba(255, 255, 255, 0.08)',
  accent: '#D1225A',
  accentBright: '#F04A80',
  accentRing: 'rgba(240, 74, 128, 0.32)',
  accentTint: '#472735',
  disabled: '#2D2D30',
  // Kenyan flag.
  kenyaBlack: '#0A0A0A',
  kenyaRed: '#BB0000',
  kenyaGreen: '#006B3F',
  mpesa: '#2FA84F',
  airtel: '#E2231A',
  plate: '#FFD200',
  // Apple Music–style artist page, in solid tones.
  page: '#2A1517',
  pageCard: '#3A2023',
  pageButton: 'rgba(255, 255, 255, 0.16)',
  glass: 'rgba(28, 28, 30, 0.96)',
} as const;

export const TIKITI_TRAY_CONTENT = {
  backgroundColor: tikitiColors.sheet,
  cornerRadius: 40,
} as const;

// Google Maps (Android) styled after the reference's teal Apple Maps look.
export const DARK_MAP_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#1E6157' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#E2EEF2' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1E6157' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#7D9AAE' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#B7C9D6' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#DCE6EC' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0B4A55' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#2A7A5E' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#25695E' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
];
