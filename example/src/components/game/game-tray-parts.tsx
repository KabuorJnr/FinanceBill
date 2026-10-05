import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SymbolView, type SFSymbol } from '../symbol-view';
import { Tray, useTray } from 'morphlet';

import { artistColors, artistType } from '../artist/artist.theme';
import {
  TrayCloseButton,
  TrayIconButton,
  trayStyles,
} from '../artist/artist-tray-parts';
import { gameColors } from './game.theme';

interface IGameTrayView {
  title: string;
  back?: boolean;
}

interface IGameTrayHeaderProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  views?: Record<string, IGameTrayView>;
}

export function GameTrayHeader({
  title,
  subtitle,
  leading,
  views = {},
}: IGameTrayHeaderProps) {
  const { view, goBack } = useTray();
  const nested = view ? views[view] : undefined;

  return (
    <Tray.Header style={trayStyles.header}>
      <Tray.Morph value={nested ? view! : ''} style={trayStyles.heading}>
        {nested ? (
          <View style={trayStyles.headingRow}>
            {nested.back !== false && (
              <TrayIconButton
                icon="chevron.left"
                label="Back"
                onPress={goBack}
              />
            )}
            <Tray.Title style={trayStyles.title} numberOfLines={1}>
              {nested.title}
            </Tray.Title>
          </View>
        ) : (
          <View style={trayStyles.headingRow}>
            {leading}
            <View style={trayStyles.headingText}>
              <Tray.Title style={trayStyles.title} numberOfLines={1}>
                {title}
              </Tray.Title>
              {!!subtitle && (
                <Text style={artistType.caption} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
        )}
      </Tray.Morph>

      <TrayCloseButton />
    </Tray.Header>
  );
}

export function TrayBadge({ icon, color }: { icon: SFSymbol; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}26` }]}>
      <SymbolView name={icon} size={20} weight="semibold" tintColor={color} />
    </View>
  );
}

interface ITrayTextAreaProps extends TextInputProps {
  counter?: string;
}

export function TrayTextArea({ counter, style, ...rest }: ITrayTextAreaProps) {
  return (
    <View style={styles.areaBox}>
      <TextInput
        multiline
        placeholderTextColor={artistColors.textTertiary}
        selectionColor={gameColors.star}
        keyboardAppearance="dark"
        style={[artistType.body, styles.area, style]}
        {...rest}
      />
      {!!counter && <Text style={styles.counter}>{counter}</Text>}
    </View>
  );
}

interface ITrayChipsProps<TValue extends string> {
  options: { value: TValue; label: string; icon?: SFSymbol }[];
  selected: TValue[];
  onPress: (value: TValue) => void;
}

export function TrayChips<TValue extends string>({
  options,
  selected,
  onPress,
}: ITrayChipsProps<TValue>) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const color = isSelected ? gameColors.playLabel : artistColors.text;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onPress(option.value)}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && !isSelected && styles.chipPressed,
            ]}
          >
            {option.icon && (
              <SymbolView
                name={option.icon}
                size={13}
                weight="semibold"
                tintColor={color}
              />
            )}
            <Text style={[styles.chipLabel, { color }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaBox: {
    borderRadius: 16,
    backgroundColor: artistColors.card,
  },
  area: {
    minHeight: 104,
    maxHeight: 160,
    textAlignVertical: 'top',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  counter: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    color: artistColors.textTertiary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: artistColors.card,
  },
  chipSelected: {
    backgroundColor: gameColors.play,
  },
  chipPressed: {
    backgroundColor: artistColors.cardPressed,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
