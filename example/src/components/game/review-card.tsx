import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import type { IGameReview } from './game.data';
import { gameColors, gameLayout } from './game.theme';
import { StarRow } from './stars';

interface IReviewCardProps {
  review: IGameReview;
  lines?: number;
}

export const ReviewCard = memo(function ReviewCard({
  review,
  lines,
}: IReviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={{ uri: review.avatar }}
          transition={200}
          style={styles.avatar}
        />
        <Text style={styles.author} numberOfLines={1}>
          {review.author}
        </Text>
        <StarRow rating={review.rating} size={16} gap={6} />
      </View>
      <Text style={styles.text} numberOfLines={lines}>
        {review.text}
      </Text>
      <Text style={styles.date}>{review.date}</Text>
    </View>
  );
});

const AVATAR = 32;

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 18,
    paddingLeft: 22,
    borderRadius: gameLayout.cardRadius,
    borderCurve: 'continuous',
    backgroundColor: gameColors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: gameColors.pill,
  },
  author: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: gameColors.textSecondary,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  date: {
    fontSize: 13,
    color: gameColors.textTertiary,
  },
});
