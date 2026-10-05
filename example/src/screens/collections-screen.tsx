import { useCallback, useRef } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  type ScrollViewImperativeMethods,
} from 'react-native';
import { ProgressiveBlurView } from 'expo-backdrop';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Transition from 'react-native-screen-transitions';

import {
  COLLECTIONS_BAR_CLEARANCE,
  COLLECTIONS_HERO_ID,
  CollectionCard,
  CollectionsBottomBar,
  CollectionsHeader,
  collectionColors,
  collectionLayout,
  useCollections,
} from '../components/collections';
import { withAlpha } from '../utils';

const HEADER_HEIGHT = collectionLayout.buttonSize;
const CARD_GAP = 44;
const LIST_SPRING = LinearTransition.springify().damping(22).stiffness(180);

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { collections } = useCollections();
  const scrollRef = useRef<ScrollViewImperativeMethods>(null);
  const initialIds = useRef(new Set(collections.map((item) => item.id)));

  const cardWidth = width - collectionLayout.gutter * 2;
  const headerTop = insets.top + 8;
  const topEdge = headerTop + HEADER_HEIGHT + 16;
  const bottomEdge = insets.bottom + COLLECTIONS_BAR_CLEARANCE;

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [scrollRef]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <Transition.ScrollView
        ref={scrollRef as never}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.list,
          { paddingTop: topEdge + 12, paddingBottom: bottomEdge + 24 },
        ]}
      >
        {collections.map((collection, index) => (
          <Animated.View
            key={collection.id}
            entering={
              initialIds.current.has(collection.id)
                ? undefined
                : FadeInDown.springify().damping(20)
            }
            layout={LIST_SPRING}
          >
            <CollectionCard
              collection={collection}
              width={cardWidth}
              boundaryId={index === 0 ? COLLECTIONS_HERO_ID : undefined}
            />
          </Animated.View>
        ))}
      </Transition.ScrollView>

      <ProgressiveBlurView
        edge="top"
        intensity={60}
        tintColor={withAlpha(collectionColors.background, 0.7)}
        fallbackColor={collectionColors.background}
        style={[styles.edge, { top: 0, height: topEdge + 12 }]}
      />
      <ProgressiveBlurView
        edge="bottom"
        intensity={60}
        tintColor={withAlpha(collectionColors.background, 0.7)}
        fallbackColor={collectionColors.background}
        style={[styles.edge, { bottom: 0, height: bottomEdge + 12 }]}
      />

      <View style={[styles.header, { top: headerTop }]}>
        <CollectionsHeader />
      </View>

      <CollectionsBottomBar onCreated={scrollToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: collectionColors.background,
  },
  list: {
    alignItems: 'center',
    gap: CARD_GAP,
  },
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
