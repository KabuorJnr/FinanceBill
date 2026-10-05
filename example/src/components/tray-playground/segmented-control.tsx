import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { playgroundColors, playgroundType } from './playground.theme';

const PADDING = 3;
const SLIDE_SPRING = { stiffness: 380, damping: 32, mass: 0.9 };
const PRESS_SPRING = { stiffness: 500, damping: 30 };

interface ISegmentedControlProps<T> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T>({
  options,
  value,
  onChange,
}: ISegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const segmentWidth = width > 0 ? (width - PADDING * 2) / options.length : 0;

  const offset = useSharedValue(0);
  const pressed = useSharedValue(1);
  const isMeasured = useSharedValue(false);

  useEffect(() => {
    if (segmentWidth === 0) return;
    const target = selected * segmentWidth;
    if (isMeasured.value) {
      offset.value = withSpring(target, SLIDE_SPRING);
    } else {
      offset.value = target;
      isMeasured.value = true;
    }
  }, [selected, segmentWidth, offset, isMeasured]);

  const thumbStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: offset.value }, { scale: pressed.value }],
  }));

  return (
    <View
      style={styles.track}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {segmentWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.thumb, thumbStyle]}
        />
      )}
      {options.map((option, index) => {
        const isSelected = index === selected;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPressIn={() => {
              if (isSelected) pressed.value = withSpring(0.94, PRESS_SPRING);
            }}
            onPressOut={() => {
              pressed.value = withSpring(1, PRESS_SPRING);
            }}
            onPress={() => onChange(option.value)}
            style={styles.segment}
          >
            <Text
              style={[
                playgroundType.caption,
                styles.label,
                isSelected && styles.labelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: PADDING,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: playgroundColors.card,
  },
  thumb: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: 9,
    borderCurve: 'continuous',
    backgroundColor: playgroundColors.background,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
  },
  label: {
    color: playgroundColors.label,
  },
  labelSelected: {
    color: playgroundColors.text,
  },
});
