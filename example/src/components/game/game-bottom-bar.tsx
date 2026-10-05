import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IGame } from './game.data';
import { gameColors, gameLayout } from './game.theme';
import { PlayTray } from './play-tray';
import { RemixTray } from './remix-tray';

export const GAME_BOTTOM_BAR_CLEARANCE = gameLayout.actionHeight + 48;

export const GameBottomBar = memo(function GameBottomBar({
  game,
}: {
  game: IGame;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(26,26,26,0)',
          'rgba(26,26,26,0.92)',
          gameColors.background,
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.actions}>
        <RemixTray game={game} />
        <PlayTray game={game} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 36,
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
  },
});
