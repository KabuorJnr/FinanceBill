import type { ComponentRef, Ref } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SPRING = { stiffness: 420, damping: 26, mass: 0.6 };

interface IScalePressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function ScalePressable({
  style,
  pressedScale = 0.96,
  onPressIn,
  onPressOut,
  ref,
  ...rest
}: IScalePressableProps) {
  const progress = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, pressedScale]) },
    ],
  }));

  return (
    <AnimatedPressable
      ref={ref}
      {...rest}
      onPressIn={(event: GestureResponderEvent) => {
        progress.value = withSpring(1, PRESS_SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        progress.value = withSpring(0, PRESS_SPRING);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
