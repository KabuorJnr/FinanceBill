import type { ComponentRef, ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tray, useTray } from 'morphlet';

import { SymbolView, type SFSymbol } from '../symbol-view';
import { playgroundColors, playgroundType } from './playground.theme';

interface IHeaderView {
  title: string;
  back?: boolean;
}

export function PlaygroundTrayHeader({
  title = '',
  views = {},
  accessory,
}: {
  title?: string;
  views?: Record<string, IHeaderView>;
  accessory?: ReactNode;
}) {
  const { view, goBack, canGoBack } = useTray();
  const current = (view && views[view]) || { title };
  const showBack = current.back ?? canGoBack;

  return (
    <Tray.Header style={styles.header}>
      <Tray.Morph value={view ?? ''} style={styles.heading}>
        <View style={styles.headingRow}>
          {showBack && (
            <CircleButton icon="chevron.left" label="Back" onPress={goBack} />
          )}
          <Tray.Title style={playgroundType.title} numberOfLines={1}>
            {current.title}
          </Tray.Title>
        </View>
      </Tray.Morph>
      {accessory}
      <Tray.Close asChild>
        <CircleButton icon="xmark" label="Close" />
      </Tray.Close>
    </Tray.Header>
  );
}

export function TrayAlertHeader({
  icon,
  color,
}: {
  icon: SFSymbol;
  color: string;
}) {
  return (
    <Tray.Header style={[styles.header, styles.alertHeader]}>
      <TrayBadge icon={icon} color={color} />
      <Tray.Close asChild>
        <CircleButton icon="xmark" label="Close" />
      </Tray.Close>
    </Tray.Header>
  );
}

interface ICircleButtonProps {
  icon: SFSymbol;
  label: string;
  onPress?: () => void;
}

export function CircleButton({ icon, label, onPress }: ICircleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.circle, pressed && styles.pressed]}
    >
      <SymbolView
        name={icon}
        size={13}
        weight="bold"
        tintColor={playgroundColors.label}
      />
    </Pressable>
  );
}

interface IPillButtonProps {
  label: string;
  icon?: SFSymbol;
  variant?: 'primary' | 'filled' | 'secondary' | 'danger';
  fit?: boolean;
  onPress?: () => void;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export function PillButton({
  label,
  icon,
  variant = 'secondary',
  fit,
  onPress,
  ref,
}: IPillButtonProps) {
  const color =
    variant === 'filled'
      ? playgroundColors.inverse
      : variant === 'primary'
        ? playgroundColors.accent
        : variant === 'danger'
          ? playgroundColors.danger
          : playgroundColors.text;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        variant === 'primary' && styles.pillPrimary,
        variant === 'danger' && styles.pillDanger,
        variant === 'filled' && styles.pillFilled,
        fit && styles.pillFit,
        pressed && styles.pillPressed,
      ]}
    >
      {icon && (
        <SymbolView name={icon} size={18} weight="semibold" tintColor={color} />
      )}
      <Text style={[playgroundType.button, { color }]}>{label}</Text>
    </Pressable>
  );
}

interface ITrayRowProps {
  icon: SFSymbol;
  label: string;
  navigates?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
}

export function TrayRow({
  icon,
  label,
  navigates,
  trailing,
  onPress,
}: ITrayRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <SymbolView name={icon} size={18} tintColor={playgroundColors.text} />
      <Text style={[playgroundType.value, styles.rowLabel]}>{label}</Text>
      {trailing}
      {navigates && (
        <SymbolView
          name="chevron.right"
          size={12}
          weight="semibold"
          tintColor={playgroundColors.label}
        />
      )}
    </Pressable>
  );
}

export function TrayBadge({ icon, color }: { icon: SFSymbol; color: string }) {
  return (
    <SymbolView
      name={icon}
      size={34}
      weight="medium"
      tintColor={color}
      style={styles.badge}
    />
  );
}

export const playgroundTrayStyles = StyleSheet.create({
  page: {
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  group: {
    overflow: 'hidden',
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: playgroundColors.card,
  },
  message: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  messageText: {
    ...playgroundType.body,
    textAlign: 'center',
    color: playgroundColors.label,
  },
  buttons: {
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  article: {
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  heading: {
    ...playgroundType.heading,
    color: playgroundColors.text,
  },
  description: {
    ...playgroundType.body,
    color: playgroundColors.label,
  },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  heading: {
    flex: 1,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 30,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: playgroundColors.card,
  },
  pressed: {
    backgroundColor: playgroundColors.cardPressed,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 54,
    borderRadius: 27,
    backgroundColor: playgroundColors.card,
  },
  pillFit: {
    flex: 0,
  },
  pillPrimary: {
    backgroundColor: playgroundColors.accentTint,
  },
  pillFilled: {
    backgroundColor: playgroundColors.accent,
  },
  pillDanger: {
    backgroundColor: playgroundColors.dangerTint,
  },
  pillPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 54,
    paddingHorizontal: 18,
  },
  rowPressed: {
    backgroundColor: playgroundColors.cardPressed,
  },
  rowLabel: {
    flex: 1,
    color: playgroundColors.text,
  },
  alertHeader: {
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  badge: {
    width: 34,
    height: 34,
  },
});
