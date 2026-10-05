import type { ComponentRef, ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { ScalePressable } from '../artist/scale-pressable';
import { gameColors, gameLayout } from './game.theme';

interface IStatPillProps extends Omit<PressableProps, 'style' | 'children'> {
  icon: ReactNode;
  label: string;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function StatPill({ icon, label, ref, ...rest }: IStatPillProps) {
  return (
    <ScalePressable ref={ref} pressedScale={0.93} {...rest} style={styles.pill}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: gameLayout.pillHeight,
    paddingHorizontal: 14,
    borderRadius: gameLayout.pillHeight / 2,
    backgroundColor: gameColors.pill,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    color: gameColors.text,
  },
});
