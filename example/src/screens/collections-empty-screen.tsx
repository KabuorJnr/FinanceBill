import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Transition from 'react-native-screen-transitions';

import { ScalePressable } from '../components/artist/scale-pressable';
import {
  COLLECTIONS_BAR_CLEARANCE,
  COLLECTIONS_HERO_ID,
  CollectionsBottomBar,
  CollectionsHeader,
  PhotoStack,
  collectionColors,
  collectionLayout,
  collectionType,
} from '../components/collections';

const CTA_HEIGHT = 50;

export default function CollectionsEmptyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const openAll = useCallback(() => router.push('/collections/all'), [router]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />
      <CollectionsHeader />

      <View
        style={[
          styles.content,
          { paddingBottom: insets.bottom + COLLECTIONS_BAR_CLEARANCE },
        ]}
      >
        <Transition.Boundary
          id={COLLECTIONS_HERO_ID}
          accessibilityRole="button"
          accessibilityLabel="Open your collections"
          onPress={openAll}
        >
          <PhotoStack />
        </Transition.Boundary>

        <View style={styles.copy}>
          <Text style={collectionType.heroTitle}>
            It starts with a collection
          </Text>
          <Text style={collectionType.meta}>
            Create one to start sharing memories
          </Text>
        </View>

        <ScalePressable
          accessibilityRole="button"
          onPress={openAll}
          style={styles.cta}
        >
          <Text style={collectionType.button}>
            Create your first collection
          </Text>
        </ScalePressable>
      </View>

      <CollectionsBottomBar onViewAll={openAll} onCreated={openAll} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: collectionColors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: collectionLayout.gutter,
  },
  copy: {
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  cta: {
    height: CTA_HEIGHT,
    marginTop: 22,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CTA_HEIGHT / 2,
    backgroundColor: collectionColors.accent,
  },
});
