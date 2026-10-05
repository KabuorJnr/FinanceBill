import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, type LatLng } from 'react-native-maps';

import { SymbolView, type SFSymbol } from '../symbol-view';
import { regionFor, routeBetween } from './tikiti.data';
import { DARK_MAP_STYLE, tikitiColors } from './tikiti.theme';

export interface IMapPin {
  coordinate: LatLng;
  icon: SFSymbol;
  color?: string;
}

interface IPinMapProps {
  pins: IMapPin[];
  /** Draws the rider's position and a route from it to the first pin. */
  origin?: LatLng;
  height?: number;
}

// Custom marker views are rasterised on Android; keep tracking changes just
// long enough to render them, then freeze for performance.
function useTracksViewChanges() {
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setTracks(false), 800);
    return () => clearTimeout(timer);
  }, []);
  return Platform.OS === 'android' ? tracks : false;
}

export function PinMap({ pins, origin, height = 150 }: IPinMapProps) {
  const points = pins.map((pin) => pin.coordinate);
  const region = regionFor(origin ? [origin, ...points] : points);
  const tracksViewChanges = useTracksViewChanges();
  const target = pins[0];

  return (
    <View style={[styles.map, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        userInterfaceStyle="dark"
        customMapStyle={DARK_MAP_STYLE}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsPointsOfInterests={false}
      >
        {origin && target && (
          <>
            <Polyline
              coordinates={routeBetween(origin, target.coordinate)}
              strokeColor={tikitiColors.accent}
              strokeWidth={4}
              lineCap="round"
            />
            <Marker
              coordinate={origin}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={tracksViewChanges}
            >
              <View style={styles.origin} />
            </Marker>
          </>
        )}
        {pins.map((pin, index) => (
          <Marker
            key={`${pin.coordinate.latitude},${pin.coordinate.longitude}`}
            coordinate={pin.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={tracksViewChanges}
            zIndex={pins.length - index}
          >
            <View
              style={[
                styles.pin,
                { backgroundColor: pin.color ?? tikitiColors.accent },
              ]}
            >
              <SymbolView
                name={pin.icon}
                size={13}
                weight="semibold"
                tintColor={tikitiColors.text}
              />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    overflow: 'hidden',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  origin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: tikitiColors.text,
    backgroundColor: '#0A84FF',
  },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: tikitiColors.text,
    backgroundColor: tikitiColors.accent,
  },
});
