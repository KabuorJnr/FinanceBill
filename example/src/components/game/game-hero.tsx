import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCircleButton } from '../artist/artist-glass-button';
import type { IGame } from './game.data';
import { gameColors, gameLayout } from './game.theme';
import { MoreTray } from './more-tray';

const NAV_BUTTON = 50;

interface IGameHeroProps {
  game: IGame;
  height: number;
  scrollY: SharedValue<number>;
}

export const GameHero = memo(function GameHero({
  game,
  height,
  scrollY,
}: IGameHeroProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      transform: [
        { translateY: y < 0 ? y : y * 0.5 },
        {
          scale: interpolate(y, [-height, 0], [2, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <View style={[styles.hero, { height }]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <Image
          source={{ uri: game.hero }}
          transition={300}
          contentPosition="top"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'transparent']}
          locations={[0, 0.3]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['transparent', 'rgba(26,26,26,0.7)', gameColors.background]}
          locations={[0.45, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
});

interface IGameNavBarProps {
  game: IGame;
  onBackPress: () => void;
}

export function GameNavBar({ game, onBackPress }: IGameNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.nav, { top: insets.top + 6 }]}
    >
      <GlassCircleButton
        icon="arrow.left"
        label="Back"
        scheme="dark"
        size={NAV_BUTTON}
        iconSize={20}
        onPress={onBackPress}
      />
      <MoreTray game={game} size={NAV_BUTTON} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: gameColors.background,
  },
  nav: {
    position: 'absolute',
    left: gameLayout.gutter,
    right: gameLayout.gutter,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
