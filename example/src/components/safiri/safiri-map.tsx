import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { SymbolView } from '../symbol-view';
import { routeBetween, type ICity, type IPlace } from './kenya.data';
import { SAFIRI_MAP_PADDING, safiriColors } from './safiri.theme';

interface ISafiriMapProps {
  city: ICity;
  destination: IPlace | null;
  recenterKey: number;
  onPlacePress: (place: IPlace) => void;
}

const REGION_MS = 650;

function SafiriMapView({
  city,
  destination,
  recenterKey,
  onPlacePress,
}: ISafiriMapProps) {
  const map = useRef<MapView>(null);
  const route = useMemo(
    () =>
      destination
        ? routeBetween(city.pickup.coordinate, destination.coordinate)
        : null,
    [city, destination]
  );

  useEffect(() => {
    if (destination) {
      map.current?.fitToCoordinates(
        [city.pickup.coordinate, destination.coordinate],
        { edgePadding: SAFIRI_MAP_PADDING, animated: true }
      );
    } else {
      map.current?.animateToRegion(city.region, REGION_MS);
    }
  }, [city, destination, recenterKey]);

  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      initialRegion={city.region}
      mapPadding={SAFIRI_MAP_PADDING}
      userInterfaceStyle="light"
      showsCompass={false}
      showsPointsOfInterests={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {route && (
        <Polyline
          coordinates={route}
          strokeColor={safiriColors.route}
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      )}

      <PlaceMarker place={city.pickup} kind="pickup" />

      {city.places.map((place) => (
        <PlaceMarker
          key={place.id}
          place={place}
          kind={place.id === destination?.id ? 'destination' : 'place'}
          onPress={() => onPlacePress(place)}
        />
      ))}
    </MapView>
  );
}

export const SafiriMap = memo(SafiriMapView);

type TMarkerKind = 'pickup' | 'place' | 'destination';

interface IPlaceMarkerProps {
  place: IPlace;
  kind: TMarkerKind;
  onPress?: () => void;
}

// Custom marker views are rasterised on Android; keep tracking changes just
// long enough for the icon image to load, then freeze them for performance.
function useTracksViewChanges(kind: TMarkerKind) {
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    setTracks(true);
    const timer = setTimeout(() => setTracks(false), 800);
    return () => clearTimeout(timer);
  }, [kind]);
  return Platform.OS === 'android' ? tracks : false;
}

function PlaceMarker({ place, kind, onPress }: IPlaceMarkerProps) {
  const tracksViewChanges = useTracksViewChanges(kind);

  return (
    <Marker
      identifier={place.id}
      coordinate={place.coordinate}
      title={place.name}
      description={place.area}
      anchor={kind === 'destination' ? { x: 0.5, y: 1 } : { x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      zIndex={kind === 'place' ? 1 : 2}
      onPress={onPress}
    >
      {kind === 'pickup' ? (
        <View style={styles.pickup}>
          <View style={styles.pickupDot} />
        </View>
      ) : kind === 'destination' ? (
        <View style={styles.pin}>
          <View style={styles.pinHead}>
            <SymbolView
              name={place.icon}
              size={16}
              weight="semibold"
              tintColor={safiriColors.inverse}
            />
          </View>
          <View style={styles.pinTail} />
        </View>
      ) : (
        <View style={styles.place}>
          <SymbolView
            name={place.icon}
            size={13}
            weight="semibold"
            tintColor={safiriColors.green}
          />
        </View>
      )}
    </Marker>
  );
}

const styles = StyleSheet.create({
  pickup: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: safiriColors.routeShadow,
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: safiriColors.inverse,
    backgroundColor: safiriColors.green,
  },
  place: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: safiriColors.green,
    backgroundColor: safiriColors.inverse,
  },
  pin: {
    alignItems: 'center',
  },
  pinHead: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: safiriColors.inverse,
    backgroundColor: safiriColors.red,
  },
  pinTail: {
    width: 3,
    height: 10,
    marginTop: -1,
    borderRadius: 1.5,
    backgroundColor: safiriColors.red,
  },
});
