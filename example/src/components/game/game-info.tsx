import { memo, useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from '../symbol-view';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import type { IGame } from './game.data';
import { formatCount, gameColors, gameLayout, gameType } from './game.theme';
import { RatingTray } from './rating-tray';
import { StatPill } from './stat-pill';

interface IGameInfoProps {
  game: IGame;
  onReviewSubmit: (rating: number, text: string) => void;
}

export const GameInfo = memo(function GameInfo({
  game,
  onReviewSubmit,
}: IGameInfoProps) {
  return (
    <View style={styles.info}>
      <View style={styles.identity}>
        <Image
          source={{ uri: game.avatar }}
          transition={250}
          contentPosition={{ top: '18%', left: '50%' }}
          style={styles.avatar}
        />
        <View style={styles.tags}>
          {game.tags.map((tag) => (
            <View key={tag.label} style={styles.tag}>
              <SymbolView
                name={tag.icon}
                size={17}
                weight="medium"
                tintColor={gameColors.text}
              />
              <Text style={gameType.label}>{tag.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={gameType.title}>{game.title}</Text>
        <Text style={gameType.body}>{game.description}</Text>
      </View>

      <View style={styles.stats}>
        <StatPill
          accessibilityLabel={`${formatCount(game.plays, 'K')} plays`}
          icon={
            <SymbolView
              name="play"
              size={16}
              weight="semibold"
              tintColor={gameColors.text}
            />
          }
          label={`${formatCount(game.plays, 'K')} Plays`}
        />
        <LikePill likes={game.likes} />
        <RatingTray game={game} onSubmit={onReviewSubmit}>
          <StatPill
            accessibilityRole="button"
            accessibilityLabel={`Rated ${game.rating}. See ratings`}
            icon={
              <SymbolView
                name="star.fill"
                size={18}
                tintColor={gameColors.star}
              />
            }
            label={game.rating.toFixed(1)}
          />
        </RatingTray>
      </View>
    </View>
  );
});

function LikePill({ likes }: { likes: number }) {
  const [liked, setLiked] = useState(false);
  const scale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggle = useCallback(() => {
    setLiked((value) => !value);
    scale.value = withSequence(
      withSpring(1.35, { stiffness: 600, damping: 12, mass: 0.5 }),
      withSpring(1, { stiffness: 400, damping: 14 })
    );
  }, [scale]);

  return (
    <StatPill
      accessibilityRole="button"
      accessibilityState={{ selected: liked }}
      accessibilityLabel={liked ? 'Unlike' : 'Like'}
      onPress={toggle}
      icon={
        <Animated.View style={heartStyle}>
          <SymbolView
            name={liked ? 'heart.fill' : 'heart'}
            size={18}
            weight="semibold"
            tintColor={liked ? gameColors.like : gameColors.text}
          />
        </Animated.View>
      }
      label={formatCount(likes + (liked ? 1 : 0))}
    />
  );
}

const AVATAR = gameLayout.avatar;

const styles = StyleSheet.create({
  info: {
    gap: 14,
    paddingHorizontal: gameLayout.gutter,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -AVATAR * 0.6,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: gameColors.surface,
  },
  tags: {
    flexDirection: 'row',
    gap: 22,
    paddingBottom: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  copy: {
    gap: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
});
