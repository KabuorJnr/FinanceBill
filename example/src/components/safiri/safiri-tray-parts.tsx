import type { ComponentRef, ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SymbolView, type SFSymbol } from '../symbol-view';
import { playgroundType } from '../tray-playground/playground.theme';
import { safiriColors } from './safiri.theme';

interface ISafiriButtonProps {
  label: string;
  icon?: SFSymbol;
  variant?: 'filled' | 'secondary' | 'danger';
  disabled?: boolean;
  onPress?: () => void;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function SafiriButton({
  label,
  icon,
  variant = 'filled',
  disabled = false,
  onPress,
  ref,
}: ISafiriButtonProps) {
  const color =
    variant === 'filled'
      ? safiriColors.inverse
      : variant === 'danger'
        ? safiriColors.red
        : safiriColors.text;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'filled' && styles.buttonFilled,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      {icon && (
        <SymbolView name={icon} size={18} weight="semibold" tintColor={color} />
      )}
      <Text style={[playgroundType.button, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function IconBubble({
  icon,
  color = safiriColors.text,
  background = safiriColors.background,
  size = 40,
}: {
  icon: SFSymbol;
  color?: string;
  background?: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.bubble,
        { width: size, height: size, borderRadius: size / 2 },
        { backgroundColor: background },
      ]}
    >
      <SymbolView
        name={icon}
        size={Math.round(size * 0.45)}
        weight="semibold"
        tintColor={color}
      />
    </View>
  );
}

interface IOptionRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
}

export function OptionRow({
  icon,
  title,
  subtitle,
  trailing,
  selected,
  onPress,
}: IOptionRowProps) {
  return (
    <Pressable
      accessibilityRole={selected === undefined ? 'button' : 'radio'}
      accessibilityState={
        selected === undefined ? undefined : { selected: selected }
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && !selected && styles.rowPressed,
      ]}
    >
      {icon}
      <View style={styles.rowText}>
        <Text style={[playgroundType.value, styles.title]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={[playgroundType.caption, styles.muted]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </Pressable>
  );
}

export function FactList({
  facts,
}: {
  facts: { label: string; value: string }[];
}) {
  return (
    <View style={styles.facts}>
      {facts.map((fact, index) => (
        <View
          key={fact.label}
          style={[styles.fact, index > 0 && styles.factDivider]}
        >
          <Text style={[playgroundType.label, styles.muted]}>{fact.label}</Text>
          <Text
            style={[playgroundType.value, styles.title, styles.factValue]}
            numberOfLines={1}
          >
            {fact.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function FlagStripe() {
  return (
    <View style={styles.stripe} accessibilityElementsHidden>
      <View style={[styles.band, { backgroundColor: safiriColors.black }]} />
      <View style={[styles.band, { backgroundColor: safiriColors.red }]} />
      <View style={[styles.band, { backgroundColor: safiriColors.green }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: safiriColors.card,
  },
  buttonFilled: {
    backgroundColor: safiriColors.green,
  },
  buttonDanger: {
    backgroundColor: safiriColors.redTint,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowSelected: {
    borderColor: safiriColors.green,
    backgroundColor: safiriColors.greenTint,
  },
  rowPressed: {
    backgroundColor: safiriColors.card,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: safiriColors.text,
  },
  muted: {
    color: safiriColors.label,
  },
  facts: {
    overflow: 'hidden',
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: safiriColors.card,
  },
  fact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  factDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: safiriColors.separator,
  },
  factValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  stripe: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  band: {
    flex: 1,
  },
});
