import type { MapStyleElement } from 'react-native-maps';

export const tikitiColors = {
  background: '#0B0B0C',
  sheet: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.62)',
  textTertiary: 'rgba(255, 255, 255, 0.4)',
  card: 'rgba(255, 255, 255, 0.07)',
  cardPressed: 'rgba(255, 255, 255, 0.13)',
  separator: 'rgba(255, 255, 255, 0.09)',
  accent: '#E8264A',
  accentTint: 'rgba(232, 38, 74, 0.2)',
  // Kenyan flag.
  kenyaBlack: '#0A0A0A',
  kenyaRed: '#BB0000',
  kenyaGreen: '#006B3F',
  mpesa: '#2FA84F',
  airtel: '#E2231A',
  plate: '#FFD200',
} as const;

export const TIKITI_TRAY_CONTENT = {
  backgroundColor: tikitiColors.sheet,
  cornerRadius: 40,
} as const;

// Google Maps on Android ignores userInterfaceStyle, so give it a dark style.
export const DARK_MAP_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c2a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#023e3a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];
