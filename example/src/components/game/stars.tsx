import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from '../symbol-view';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { gameColors } from './game.theme';

const STARS = [1, 2, 3, 4, 5];
const POP_SPRING = { stiffness: 520, damping: 14, mass: 0.6 };

interface IStarRowProps {
  rating: number;
  size?: number;
  gap?: number;
}

export function StarRow({ rating, size = 15, gap = 4 }: IStarRowProps) {
  return (
    <View style={[styles.row, { gap }]}>
      {STARS.map((star) => (
        <SymbolView
          key={star}
          name="star.fill"
          size={size}
          tintColor={
            star <= Math.round(rating) ? gameColors.star : gameColors.starEmpty
          }
        />
      ))}
    </View>
  );
}

interface IStarPickerProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

export function StarPicker({ value, onChange, size = 36 }: IStarPickerProps) {
  return (
    <View style={[styles.row, styles.picker]}>
      {STARS.map((star) => (
        <PickerStar
          key={star}
          index={star}
          lit={star <= value}
          size={size}
          onPress={() => onChange(star)}
        />
      ))}
    </View>
  );
}

interface IPickerStarProps {
  index: number;
  lit: boolean;
  size: number;
  onPress: () => void;
}

function PickerStar({ index, lit, size, onPress }: IPickerStarProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (!lit) return;
    const delay = setTimeout(() => {
      scale.value = withSequence(
        withSpring(1.28, POP_SPRING),
        withSpring(1, POP_SPRING)
      );
    }, index * 40);
    return () => clearTimeout(delay);
  }, [lit, index, scale]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${index} star${index > 1 ? 's' : ''}`}
      hitSlop={6}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>
        <SymbolView
          name={lit ? 'star.fill' : 'star'}
          size={size}
          weight="medium"
          tintColor={lit ? gameColors.star : gameColors.textTertiary}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 8,
  },
});
