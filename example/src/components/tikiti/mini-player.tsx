import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SymbolView } from '../symbol-view';
import { Artwork } from './artwork';
import { tikitiType } from './tikiti-parts';
import { tikitiColors } from './tikiti.theme';

interface IMiniPlayerProps {
  title: string;
  artist: string;
  playing: boolean;
  onToggle: () => void;
  onNext: () => void;
}

/** The reference's floating now-playing pill, above the tab bar. */
export function MiniPlayer({
  title,
  artist,
  playing,
  onToggle,
  onNext,
}: IMiniPlayerProps) {
  return (
    <View style={styles.player}>
      <Artwork seed={title} size={38} radius={8} />
      <View style={styles.text}>
        <Text style={[tikitiType.headline, styles.title]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={tikitiType.caption} numberOfLines={1}>
          {artist}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? 'Pause' : 'Play'}
        hitSlop={8}
        onPress={onToggle}
        style={styles.control}
      >
        <SymbolView
          name={playing ? 'pause.fill' : 'play.fill'}
          size={20}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next song"
        hitSlop={8}
        onPress={onNext}
        style={styles.control}
      >
        <SymbolView
          name="forward.fill"
          size={20}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingLeft: 9,
    paddingRight: 6,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 15,
  },
  control: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
