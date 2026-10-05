import { StyleSheet, View } from 'react-native';
import type { LatLng } from 'react-native-maps';

import type { SFSymbol } from '../symbol-view';
import { regionFor } from './tikiti.data';
import { tikitiColors } from './tikiti.theme';

export interface IMapPin {
  coordinate: LatLng;
  icon: SFSymbol;
  color?: string;
}

interface IPinMapProps {
  pins: IMapPin[];
  origin?: LatLng;
  height?: number;
}

/**
 * react-native-maps has no web build, so the web app embeds OpenStreetMap,
 * which needs no API key. It marks the first pin and frames all of them.
 */
export function PinMap({ pins, origin, height = 150 }: IPinMapProps) {
  const points = pins.map((pin) => pin.coordinate);
  const region = regionFor(origin ? [origin, ...points] : points);
  const target = pins[0]?.coordinate ?? region;
  const bbox = [
    region.longitude - region.longitudeDelta / 2,
    region.latitude - region.latitudeDelta / 2,
    region.longitude + region.longitudeDelta / 2,
    region.latitude + region.latitudeDelta / 2,
  ]
    .map((value) => value.toFixed(5))
    .join(',');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${target.latitude},${target.longitude}`;

  return (
    <View style={[styles.map, { height }]}>
      <iframe title="Map" src={src} loading="lazy" style={IFRAME_STYLE} />
    </View>
  );
}

const IFRAME_STYLE = { border: 0, width: '100%', height: '100%' } as const;

const styles = StyleSheet.create({
  map: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: tikitiColors.card,
  },
});
