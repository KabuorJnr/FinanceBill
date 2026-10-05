import type { ComponentRef, Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import { Tray, useTray } from 'morphlet';

import { SymbolView } from '../symbol-view';
import { PlaygroundTrayHeader } from '../tray-playground/playground-tray-parts';
import { playgroundType } from '../tray-playground/playground.theme';
import { CITIES, type ICity } from './kenya.data';
import { IconBubble, OptionRow } from './safiri-tray-parts';
import { SAFIRI_TRAY_CONTENT, safiriColors } from './safiri.theme';

interface ICityTrayProps {
  city: ICity;
  disabled?: boolean;
  onSelect: (city: ICity) => void;
}

export function CityTray({ city, disabled, onSelect }: ICityTrayProps) {
  return (
    <Tray.Root>
      <Tray.Trigger asChild morph disabled={disabled}>
        <CityPill city={city} />
      </Tray.Trigger>

      <Tray.Content {...SAFIRI_TRAY_CONTENT}>
        <PlaygroundTrayHeader title="Choose a city" />
        <Tray.Body>
          <CityList city={city} onSelect={onSelect} />
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

interface ICityPillProps extends Omit<PressableProps, 'style'> {
  city: ICity;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

function CityPill({ city, ref, ...rest }: ICityPillProps) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={`City: ${city.name}. Change city`}
      {...rest}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      <SymbolView
        name="mappin.and.ellipse"
        size={15}
        weight="semibold"
        tintColor={safiriColors.red}
      />
      <Text style={[playgroundType.value, styles.pillText]}>{city.name}</Text>
      <SymbolView
        name="chevron.down"
        size={11}
        weight="bold"
        tintColor={safiriColors.label}
      />
    </Pressable>
  );
}

function CityList({
  city,
  onSelect,
}: {
  city: ICity;
  onSelect: (city: ICity) => void;
}) {
  const { close } = useTray();

  return (
    <View style={styles.list}>
      {CITIES.map((option) => (
        <OptionRow
          key={option.id}
          selected={option.id === city.id}
          icon={
            <IconBubble
              icon="building.2.fill"
              color={safiriColors.green}
              background={safiriColors.greenTint}
            />
          }
          title={option.name}
          subtitle={`${option.county} · ${option.places.length} places`}
          onPress={() => {
            onSelect(option);
            close();
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: safiriColors.background,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  pillText: {
    color: safiriColors.text,
  },
  list: {
    gap: 4,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
