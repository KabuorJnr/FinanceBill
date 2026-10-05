import type { ComponentRef, Ref } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { ScalePressable } from '../artist/scale-pressable';
import { gameColors, gameLayout } from './game.theme';

interface IGameActionButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: 'primary' | 'secondary';
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function GameActionButton({
  label,
  variant = 'primary',
  ref,
  ...rest
}: IGameActionButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <ScalePressable
      ref={ref}
      accessibilityRole="button"
      pressedScale={0.95}
      {...rest}
      style={[styles.button, isPrimary ? styles.primary : styles.secondary]}
    >
      <Text
        style={[
          styles.label,
          { color: isPrimary ? gameColors.playLabel : gameColors.remixLabel },
        ]}
      >
        {label}
      </Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: gameLayout.actionHeight,
    borderRadius: gameLayout.actionHeight / 2,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: gameColors.play,
  },
  secondary: {
    backgroundColor: gameColors.surface,
  },
  label: {
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
