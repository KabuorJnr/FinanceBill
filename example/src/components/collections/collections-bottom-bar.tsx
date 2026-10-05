import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from '../symbol-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { collectionColors, collectionLayout } from './collections.theme';
import { CollectionsTray } from './collections-tray';
import { GlassIconButton, GlassSurface, type TIcon } from './glass-surface';

const TAB_SIZE = 50;
const BAR_PADDING = 4;
export const COLLECTIONS_BAR_CLEARANCE = collectionLayout.fabSize + 32;

type TTab = 'collections' | 'friends' | 'activity';

const TABS: { key: TTab; label: string; icon: TIcon; badge?: boolean }[] = [
  {
    key: 'collections',
    label: 'Collections',
    icon: { ios: 'square.split.1x2.fill', android: 'view_agenda' },
  },
  {
    key: 'friends',
    label: 'Friends',
    icon: { ios: 'person.2', android: 'group' },
  },
  {
    key: 'activity',
    label: 'Activity',
    icon: { ios: 'text.bubble', android: 'chat_bubble' },
    badge: true,
  },
];

interface ICollectionsBottomBarProps {
  onViewAll?: () => void;
  onCreated?: () => void;
}

export function CollectionsBottomBar({
  onViewAll,
  onCreated,
}: ICollectionsBottomBarProps) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TTab>('collections');

  return (
    <View
      pointerEvents="box-none"
      style={[styles.bar, { bottom: Math.max(insets.bottom, 16) }]}
    >
      <GlassSurface style={styles.tabs}>
        {TABS.map((item) => {
          const selected = item.key === tab;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              onPress={() => setTab(item.key)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <SymbolView
                name={item.icon}
                size={21}
                weight={selected ? 'semibold' : 'regular'}
                tintColor={
                  selected
                    ? collectionColors.text
                    : collectionColors.textSecondary
                }
              />
              {item.badge && <View style={styles.badge} />}
            </Pressable>
          );
        })}
      </GlassSurface>

      <CollectionsTray onViewAll={onViewAll} onCreated={onCreated}>
        <GlassIconButton
          icon={{ ios: 'plus', android: 'add' }}
          label="New"
          tone="dark"
          size={collectionLayout.fabSize}
          iconSize={22}
        />
      </CollectionsTray>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: collectionLayout.gutter - 4,
    right: collectionLayout.gutter - 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabs: {
    flexDirection: 'row',
    padding: BAR_PADDING,
    borderRadius: (TAB_SIZE + BAR_PADDING * 2) / 2,
  },
  tab: {
    width: TAB_SIZE + 4,
    height: TAB_SIZE,
    borderRadius: TAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: collectionColors.surface,
    backgroundColor: collectionColors.badge,
  },
});
