import { Platform, type TextStyle } from 'react-native';
import type { NumericTextFontWeight } from 'expo-content-transition';

import { fonts } from '../constants';

type TFontWeight = NonNullable<TextStyle['fontWeight']>;

function weightOf(weight: TFontWeight): number {
  if (typeof weight === 'number') return weight;
  if (weight === 'bold') return 700;
  const parsed = Number(weight);
  return Number.isFinite(parsed) ? parsed : 400;
}

function roundedFace(weight: TFontWeight) {
  const value = weightOf(weight);
  if (value >= 600) return fonts.bold;
  if (value >= 500) return fonts.medium;
  return fonts.regular;
}

export function sfFont(weight: TFontWeight = 'normal'): TextStyle {
  if (Platform.OS !== 'android') {
    return weight === 'normal' ? {} : { fontWeight: weight };
  }
  return {
    fontFamily: roundedFace(weight),
    fontWeight: 'normal',
    includeFontPadding: false,
  };
}

export function sfNumericFont(weight: NumericTextFontWeight) {
  if (Platform.OS !== 'android') {
    return { fontWeight: weight } as const;
  }
  return { fontFamily: roundedFace(weight), fontWeight: 'normal' } as const;
}
