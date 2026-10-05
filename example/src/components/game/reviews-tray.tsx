import { memo, type ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from '../symbol-view';
import { Tray, useTray } from 'morphlet';

import { artistColors, artistType } from '../artist/artist.theme';
import { TrayCloseButton, trayStyles } from '../artist/artist-tray-parts';
import { ScalePressable } from '../artist/scale-pressable';
import type { IGame, IGameReview } from './game.data';
import { gameColors } from './game.theme';
import { GameTrayHeader, TrayBadge } from './game-tray-parts';
import { ReviewCard } from './review-card';
import { ComposeView, ThanksView } from './review-compose';
import { StarRow } from './stars';

interface IReviewsTrayProps {
  game: IGame;
  reviews: IGameReview[];
  onSubmit: (rating: number, text: string) => void;
  children: ReactElement;
}

export const ReviewsTray = memo(function ReviewsTray({
  game,
  reviews,
  onSubmit,
  children,
}: IReviewsTrayProps) {
  return (
    <Tray.Root>
      <Tray.Trigger asChild>{children}</Tray.Trigger>

      <Tray.Content backgroundColor={gameColors.sheet}>
        <ReviewsHeader game={game} />

        <Tray.Body>
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ScrollView>
        </Tray.Body>

        <Tray.Footer style={styles.footer}>
          <WriteReviewTray onSubmit={onSubmit} />
        </Tray.Footer>
      </Tray.Content>
    </Tray.Root>
  );
});

function ReviewsHeader({ game }: { game: IGame }) {
  return (
    <Tray.Header style={trayStyles.header}>
      <View style={[trayStyles.heading, trayStyles.headingRow]}>
        <View style={trayStyles.headingText}>
          <Tray.Title style={trayStyles.title}>Reviews</Tray.Title>
          <View style={styles.subtitle}>
            <StarRow rating={game.rating} size={11} gap={2} />
            <Text style={artistType.caption}>
              {game.rating.toFixed(1)} average
            </Text>
          </View>
        </View>
      </View>
      <ExpandButton />
      <TrayCloseButton />
    </Tray.Header>
  );
}

function ExpandButton() {
  const { fullScreen, setFullScreen } = useTray();

  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={fullScreen ? 'Collapse' : 'Expand'}
      hitSlop={8}
      pressedScale={0.88}
      onPress={() => setFullScreen(!fullScreen)}
      style={trayStyles.iconButton}
    >
      <Tray.Morph value={fullScreen} transition="scale">
        <SymbolView
          name={
            fullScreen
              ? 'arrow.down.right.and.arrow.up.left'
              : 'arrow.up.left.and.arrow.down.right'
          }
          size={12}
          weight="bold"
          tintColor={artistColors.textSecondary}
        />
      </Tray.Morph>
    </ScalePressable>
  );
}

function WriteReviewTray({
  onSubmit,
}: {
  onSubmit: (rating: number, text: string) => void;
}) {
  return (
    <Tray.Root defaultView="write">
      <Tray.Trigger asChild morph>
        <ScalePressable accessibilityRole="button" style={styles.write}>
          <SymbolView
            name="square.and.pencil"
            size={16}
            weight="semibold"
            tintColor={gameColors.playLabel}
          />
          <Text style={styles.writeLabel}>Write a Review</Text>
        </ScalePressable>
      </Tray.Trigger>

      <Tray.Content stack backgroundColor={gameColors.sheet}>
        <GameTrayHeader
          title="Write a Review"
          subtitle="Share what you loved, or didn’t"
          leading={<TrayBadge icon="text.bubble" color={gameColors.star} />}
          views={{ thanks: { title: 'Posted', back: false } }}
        />
        <Tray.Body>
          <Tray.View name="write">
            <ComposeView onSubmit={onSubmit} />
          </Tray.View>
          <Tray.View name="thanks">
            <ThanksView message="Your review is live. It’s at the top of the list." />
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

const WRITE_HEIGHT = 50;

const styles = StyleSheet.create({
  list: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  write: {
    flexDirection: 'row',
    gap: 8,
    height: WRITE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: WRITE_HEIGHT / 2,
    backgroundColor: gameColors.play,
  },
  writeLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: gameColors.playLabel,
  },
});
