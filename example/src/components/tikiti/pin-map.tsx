import { Component, useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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

class MapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('Map rendering error caught:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
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

function PinMapContent({ pins, origin, height = 150 }: IPinMapProps) {
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
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        toolbarEnabled={true}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsIndoors={true}
        showsPointsOfInterests={true}
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
            <View style={styles.halo}>
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
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

export function PinMap(props: IPinMapProps) {
  const height = props.height ?? 150;
  const fallback = (
    <View style={[styles.map, styles.fallbackMap, { height }]}>
      <SymbolView
        name="map.fill"
        size={36}
        weight="semibold"
        tintColor="rgba(255, 255, 255, 0.4)"
      />
      <Text style={styles.fallbackText}>Interactive Venue Map</Text>
    </View>
  );

  return (
    <MapErrorBoundary fallback={fallback}>
      <PinMapContent {...props} />
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  map: {
    overflow: 'hidden',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  fallbackMap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fallbackText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  origin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: tikitiColors.text,
    backgroundColor: '#0A84FF',
  },
  halo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
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
