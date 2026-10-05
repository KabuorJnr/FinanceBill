import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SymbolView } from '../symbol-view';
import { playgroundColors } from './playground.theme';

const SLIDE_SPRING = { stiffness: 360, damping: 28, mass: 0.8 };

interface ISlidingCheckProps {
  index: number;
  rowHeight: number;
  size?: number;
  color?: string;
  inset?: number;
}

export function SlidingCheck({
  index,
  rowHeight,
  size = 14,
  color = playgroundColors.accent,
  inset = 18,
}: ISlidingCheckProps) {
  const offset = useSharedValue(index * rowHeight);

  useEffect(() => {
    offset.value = withSpring(index * rowHeight, SLIDE_SPRING);
  }, [index, rowHeight, offset]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.check, { right: inset, height: rowHeight }, style]}
    >
      <SymbolView
        name="checkmark"
        size={size}
        weight="bold"
        tintColor={color}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  check: {
    position: 'absolute',
    top: 0,
    justifyContent: 'center',
  },
});
