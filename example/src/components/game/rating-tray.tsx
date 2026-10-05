import { memo, useEffect, type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Tray, useTray } from 'morphlet';

import { artistColors, artistType } from '../artist/artist.theme';
import { TrayButton, trayStyles } from '../artist/artist-tray-parts';
import type { IGame } from './game.data';
import { formatCount, gameColors } from './game.theme';
import { GameTrayHeader, TrayBadge } from './game-tray-parts';
import { ComposeView, ThanksView } from './review-compose';
import { StarRow } from './stars';

interface IRatingTrayProps {
  game: IGame;
  onSubmit: (rating: number, text: string) => void;
  children: ReactElement;
}

export const RatingTray = memo(function RatingTray({
  game,
  onSubmit,
  children,
}: IRatingTrayProps) {
  return (
    <Tray.Root defaultView="summary">
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>

      <Tray.Content backgroundColor={gameColors.sheet}>
        <GameTrayHeader
          title="Ratings"
          subtitle={`${formatCount(game.reviewCount)} reviews`}
          leading={<TrayBadge icon="star.fill" color={gameColors.star} />}
          views={{
            write: { title: 'Rate & Review' },
            thanks: { title: 'Posted', back: false },
          }}
        />
        <Tray.Body>
          <Tray.View name="summary">
            <SummaryView game={game} />
          </Tray.View>
          <Tray.View name="write">
            <ComposeView onSubmit={onSubmit} />
          </Tray.View>
          <Tray.View name="thanks">
            <ThanksView message="Thanks! Your review helps other adventurers find their next quest." />
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
});

function SummaryView({ game }: { game: IGame }) {
  const { setView } = useTray();

  return (
    <View style={trayStyles.page}>
      <View style={styles.summary}>
        <View style={styles.score}>
          <Text style={styles.scoreValue}>{game.rating.toFixed(1)}</Text>
          <StarRow rating={game.rating} size={14} gap={3} />
          <Text style={artistType.caption}>out of 5</Text>
        </View>

        <View style={styles.bars}>
          {game.ratingBreakdown.map((share, index) => (
            <BreakdownBar
              key={index}
              stars={5 - index}
              share={share}
              delay={index * 60}
            />
          ))}
        </View>
      </View>

      <TrayButton
        label="Rate & Review"
        icon="square.and.pencil"
        onPress={() => setView('write')}
      />
    </View>
  );
}

interface IBreakdownBarProps {
  stars: number;
  share: number;
  delay: number;
}

function BreakdownBar({ stars, share, delay }: IBreakdownBarProps) {
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withDelay(
      200 + delay,
      withTiming(share, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
  }, [fill, share, delay]);
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{stars}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    padding: 18,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: artistColors.card,
  },
  score: {
    alignItems: 'center',
    gap: 6,
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: artistColors.text,
  },
  bars: {
    flex: 1,
    gap: 7,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    width: 10,
    fontSize: 12,
    fontWeight: '600',
    color: artistColors.textSecondary,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: gameColors.star,
  },
});
