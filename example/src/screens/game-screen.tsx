import { useCallback, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BLADEBOUND,
  GAME_BOTTOM_BAR_CLEARANCE,
  Gallery,
  GameBottomBar,
  GameHero,
  GameInfo,
  GameNavBar,
  GameReviews,
  gameColors,
  type IGameReview,
} from '../components/game';

const HERO_SHARE = 0.42;
const SECTION_GAP = 36;

export default function GameScreen() {
  const game = BLADEBOUND;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const [reviews, setReviews] = useState<IGameReview[]>(game.reviews);
  const addReview = useCallback((rating: number, text: string) => {
    setReviews((current) => [
      {
        id: `you-${Date.now()}`,
        author: 'You',
        avatar: 'https://i.pravatar.cc/120?img=68',
        rating,
        date: 'Just now',
        text: text || `Rated ${rating} out of 5.`,
      },
      ...current,
    ]);
  }, []);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + GAME_BOTTOM_BAR_CLEARANCE,
        }}
      >
        <GameHero
          game={game}
          height={Math.round(height * HERO_SHARE)}
          scrollY={scrollY}
        />
        <View style={styles.sections}>
          <GameInfo game={game} onReviewSubmit={addReview} />
          <Gallery shots={game.gallery} />
          <GameReviews game={game} reviews={reviews} onSubmit={addReview} />
        </View>
      </Animated.ScrollView>

      <GameNavBar game={game} onBackPress={goBack} />
      <GameBottomBar game={game} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: gameColors.background,
  },
  sections: {
    gap: SECTION_GAP,
  },
});
