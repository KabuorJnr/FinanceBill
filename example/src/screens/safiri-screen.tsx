import { useCallback, useState, type ComponentRef, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CityTray,
  FlagStripe,
  IconBubble,
  NAIROBI,
  RideTray,
  SafiriMap,
  TripCard,
  safiriColors,
  type IBooking,
  type ICity,
  type IPlace,
} from '../components/safiri';
import { SymbolView, type SFSymbol } from '../components/symbol-view';
import { playgroundType } from '../components/tray-playground';

const SUGGESTIONS = 3;

export default function SafiriScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [city, setCity] = useState<ICity>(NAIROBI);
  // Tapped on the map.
  const [selected, setSelected] = useState<IPlace | null>(null);
  // Being picked inside a ride tray.
  const [preview, setPreview] = useState<IPlace | null>(null);
  const [trip, setTrip] = useState<IBooking | null>(null);
  const [recenterKey, setRecenterKey] = useState(0);

  const destination = trip?.destination ?? preview ?? selected;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  const changeCity = useCallback((next: ICity) => {
    setCity(next);
    setSelected(null);
    setPreview(null);
  }, []);

  const onPlacePress = useCallback(
    (place: IPlace) => {
      if (!trip) setSelected(place);
    },
    [trip]
  );

  const onBooked = useCallback((booking: IBooking) => {
    setTrip(booking);
    setSelected(null);
    setPreview(null);
  }, []);

  const onCancelRide = useCallback(() => setPreview(null), []);

  const rideTrayProps = {
    city,
    onDestinationChange: setPreview,
    onBooked,
    onCancel: onCancelRide,
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafiriMap
        city={city}
        destination={destination}
        recenterKey={recenterKey}
        onPlacePress={onPlacePress}
      />

      <View
        pointerEvents="box-none"
        style={[styles.top, { paddingTop: insets.top + 8 }]}
      >
        <RoundButton icon="chevron.left" label="Back" onPress={goBack} />
        <CityTray city={city} disabled={!!trip} onSelect={changeCity} />
        <RoundButton
          icon="location.fill"
          label="Recenter map"
          onPress={() => setRecenterKey((key) => key + 1)}
        />
      </View>

      <View
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <FlagStripe />
        {trip ? (
          <TripCard trip={trip} onCancel={() => setTrip(null)} />
        ) : (
          <View style={styles.card}>
            <View>
              <Text style={[playgroundType.caption, styles.muted]}>
                {city.greeting}
              </Text>
              <Text style={[playgroundType.title, styles.text]}>
                Unaenda wapi?
              </Text>
            </View>

            {selected ? (
              <View style={styles.selected}>
                <RideTray key={selected.id} place={selected} {...rideTrayProps}>
                  <WideButton
                    icon={selected.icon}
                    label={`Ride to ${selected.name}`}
                  />
                </RideTray>
                <RoundButton
                  icon="xmark"
                  label="Clear destination"
                  flat
                  onPress={() => setSelected(null)}
                />
              </View>
            ) : (
              <RideTray {...rideTrayProps}>
                <SearchButton />
              </RideTray>
            )}

            <View style={styles.chips}>
              {city.places.slice(0, SUGGESTIONS).map((place) => (
                <RideTray
                  key={`${city.id}-${place.id}`}
                  place={place}
                  {...rideTrayProps}
                >
                  <PlaceChip place={place} />
                </RideTray>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

interface IPressableRefProps extends Omit<PressableProps, 'style'> {
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

function RoundButton({
  icon,
  label,
  flat,
  ...rest
}: IPressableRefProps & { icon: SFSymbol; label: string; flat?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      {...rest}
      style={({ pressed }) => [
        styles.round,
        flat ? styles.roundFlat : styles.floating,
        pressed && styles.pressed,
      ]}
    >
      <SymbolView
        name={icon}
        size={15}
        weight="semibold"
        tintColor={safiriColors.text}
      />
    </Pressable>
  );
}

function SearchButton(props: IPressableRefProps) {
  return (
    <Pressable
      accessibilityRole="search"
      accessibilityLabel="Where to?"
      {...props}
      style={({ pressed }) => [styles.search, pressed && styles.pressed]}
    >
      <SymbolView
        name="magnifyingglass"
        size={17}
        weight="semibold"
        tintColor={safiriColors.text}
      />
      <Text style={[playgroundType.value, styles.searchText]}>Where to?</Text>
      <View style={styles.now}>
        <SymbolView
          name="clock.fill"
          size={12}
          weight="semibold"
          tintColor={safiriColors.text}
        />
        <Text style={[playgroundType.caption, styles.text]}>Now</Text>
      </View>
    </Pressable>
  );
}

function WideButton({
  icon,
  label,
  ...rest
}: IPressableRefProps & { icon: SFSymbol; label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [styles.wide, pressed && styles.pressed]}
    >
      <SymbolView
        name={icon}
        size={17}
        weight="semibold"
        tintColor={safiriColors.inverse}
      />
      <Text style={[playgroundType.button, styles.wideText]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function PlaceChip({ place, ...rest }: IPressableRefProps & { place: IPlace }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ride to ${place.name}`}
      {...rest}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <IconBubble
        icon={place.icon}
        size={28}
        color={safiriColors.green}
        background={safiriColors.greenTint}
      />
      <Text style={[playgroundType.caption, styles.chipText]} numberOfLines={1}>
        {place.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: safiriColors.card,
  },
  text: {
    color: safiriColors.text,
  },
  muted: {
    color: safiriColors.label,
  },
  pressed: {
    opacity: 0.8,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: safiriColors.background,
  },
  roundFlat: {
    backgroundColor: safiriColors.card,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 16,
    paddingTop: 18,
    paddingHorizontal: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderCurve: 'continuous',
    backgroundColor: safiriColors.background,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  card: {
    gap: 14,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    paddingLeft: 18,
    paddingRight: 8,
    borderRadius: 27,
    backgroundColor: safiriColors.card,
  },
  searchText: {
    flex: 1,
    color: safiriColors.label,
  },
  now: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: safiriColors.background,
  },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    paddingHorizontal: 18,
    borderRadius: 27,
    backgroundColor: safiriColors.green,
  },
  wideText: {
    flexShrink: 1,
    color: safiriColors.inverse,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: safiriColors.separator,
  },
  chipText: {
    flexShrink: 1,
    color: safiriColors.text,
  },
});
