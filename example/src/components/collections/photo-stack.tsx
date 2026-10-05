import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { EMPTY_STATE_PHOTOS } from './collections.data';
import { collectionColors } from './collections.theme';

const CARD_WIDTH = 168;
const CARD_HEIGHT = 212;
const FAN_SPRING = { stiffness: 180, damping: 18, mass: 0.9 };
const FAN_DELAY_MS = 120;

const POSES = {
  left: { x: -62, y: -38, rotate: -14, scale: 0.92 },
  right: { x: 64, y: -30, rotate: 11, scale: 0.88 },
  front: { x: 0, y: 12, rotate: -3, scale: 1 },
} as const;

type TCard = keyof typeof POSES;

export function PhotoStack() {
  const fan = useSharedValue(0);

  useEffect(() => {
    fan.value = withDelay(FAN_DELAY_MS, withSpring(1, FAN_SPRING));
  }, [fan]);

  return (
    <View style={styles.stage}>
      <StackCard card="left" fan={fan} />
      <StackCard card="right" fan={fan} />
      <StackCard card="front" fan={fan} />
    </View>
  );
}

function StackCard({ card, fan }: { card: TCard; fan: SharedValue<number> }) {
  const pose = POSES[card];
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(fan.value, [0, 1], [0, pose.x]) },
      { translateY: interpolate(fan.value, [0, 1], [10, pose.y]) },
      { rotate: `${interpolate(fan.value, [0, 1], [0, pose.rotate])}deg` },
      { scale: interpolate(fan.value, [0, 1], [0.94, pose.scale]) },
    ],
  }));

  return (
    <Animated.View style={[styles.card, style]}>
      <Image
        source={{ uri: EMPTY_STATE_PHOTOS[card] }}
        transition={250}
        contentFit="cover"
        style={styles.image}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: CARD_WIDTH * 1.9,
    height: CARD_HEIGHT * 1.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 26,
    borderCurve: 'continuous',
    borderWidth: 3,
    borderColor: collectionColors.photoBorder,
    backgroundColor: collectionColors.photoBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  image: {
    flex: 1,
    borderRadius: 23,
    borderCurve: 'continuous',
    backgroundColor: collectionColors.fieldPressed,
  },
});
