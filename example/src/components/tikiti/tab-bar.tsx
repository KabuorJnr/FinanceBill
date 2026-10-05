import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sfFont } from '../../utils';
import { SymbolView, type SFSymbol } from '../symbol-view';
import { HotelsTray } from './hotels-tray';
import { OrganizerTray } from './organizer-tray';
import { SearchTray } from './search-tray';
import { tikitiColors } from './tikiti.theme';

export type TTab = 'home' | 'artists' | 'stays' | 'organise' | 'search';

interface ITabItemProps extends Omit<PressableProps, 'style'> {
  icon: SFSymbol;
  label: string;
  active?: boolean;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

function TabItem({ icon, label, active, ref, ...rest }: ITabItemProps) {
  const color = active ? tikitiColors.accentBright : tikitiColors.text;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      {...rest}
      style={({ pressed }) => [
        styles.item,
        active && styles.itemActive,
        pressed && styles.pressed,
      ]}
    >
      <SymbolView name={icon} size={20} weight="semibold" tintColor={color} />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * The reference's floating tab bar, mapped to Tikiti: two screens, and three
 * tabs that morph straight into their trays.
 */
export function TabBar({
  active,
  accessory,
}: {
  active: TTab;
  /** Shown above the bar, like the reference's mini player. */
  accessory?: ReactNode;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      {accessory}
      <View style={styles.bar}>
        <TabItem
          icon="house.fill"
          label="Home"
          active={active === 'home'}
          onPress={() => active !== 'home' && router.navigate('/')}
        />
        <TabItem
          icon="music.note"
          label="Artists"
          active={active === 'artists'}
          onPress={() => active !== 'artists' && router.navigate('/artist')}
        />
        <HotelsTray>
          <TabItem icon="bed.double.fill" label="Stays" />
        </HotelsTray>
        <OrganizerTray>
          <TabItem icon="plus" label="Organise" />
        </OrganizerTray>
        <SearchTray>
          <TabItem icon="magnifyingglass" label="Search" />
        </SearchTray>
      </View>
    </View>
  );
}

export const TAB_BAR_CLEARANCE = 96;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: 8,
    paddingHorizontal: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 62,
    padding: 5,
    borderRadius: 31,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 26,
  },
  itemActive: {
    backgroundColor: 'rgba(240, 74, 128, 0.16)',
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 10,
    ...sfFont('600'),
  },
});
