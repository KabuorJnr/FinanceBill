import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from '../symbol-view';

import { ScalePressable } from '../artist/scale-pressable';
import type { IGame, IGameReview } from './game.data';
import { gameColors, gameLayout, gameType } from './game.theme';
import { ReviewCard } from './review-card';
import { ReviewsTray } from './reviews-tray';

const PREVIEW_COUNT = 2;

interface IGameReviewsProps {
  game: IGame;
  reviews: IGameReview[];
  onSubmit: (rating: number, text: string) => void;
}

export const GameReviews = memo(function GameReviews({
  game,
  reviews,
  onSubmit,
}: IGameReviewsProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={gameType.section}>Reviews</Text>
        <ReviewsTray game={game} reviews={reviews} onSubmit={onSubmit}>
          <ScalePressable
            accessibilityRole="button"
            hitSlop={10}
            pressedScale={0.94}
            style={styles.seeAll}
          >
            <Text style={gameType.section}>See all</Text>
            <SymbolView
              name="chevron.right"
              size={13}
              weight="semibold"
              tintColor={gameColors.textSecondary}
            />
          </ScalePressable>
        </ReviewsTray>
      </View>

      <View style={styles.cards}>
        {reviews.slice(0, PREVIEW_COUNT).map((review) => (
          <ReviewCard key={review.id} review={review} lines={3} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: 14,
    paddingHorizontal: gameLayout.gutter,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cards: {
    gap: 12,
  },
});
