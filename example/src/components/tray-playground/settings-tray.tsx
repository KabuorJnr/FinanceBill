import type { ComponentRef, ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tray } from 'morphlet';

import { SymbolView } from '../symbol-view';
import {
  PillButton,
  PlaygroundTrayHeader,
  playgroundTrayStyles as s,
} from './playground-tray-parts';
import {
  SPEEDS,
  SPRINGS,
  TRAY_CONTENT,
  playgroundColors,
  playgroundType,
  type IPlaygroundSettings,
} from './playground.theme';
import { SegmentedControl } from './segmented-control';

interface ISettingsTrayProps {
  settings: IPlaygroundSettings;
  onChange: (settings: IPlaygroundSettings) => void;
}

export function SettingsTray({ settings, onChange }: ISettingsTrayProps) {
  const set = (patch: Partial<IPlaygroundSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <Tray.Root animation={settings.spring}>
      <Tray.Trigger asChild>
        <SettingsButton />
      </Tray.Trigger>

      <Tray.Content {...TRAY_CONTENT}>
        <PlaygroundTrayHeader title="Animation" />
        <Tray.Body>
          <View style={[s.page, styles.page]}>
            <Setting label="Spring">
              <SegmentedControl
                options={SPRINGS}
                value={settings.spring}
                onChange={(spring) => set({ spring })}
              />
            </Setting>
            <Setting
              label="Speed"
              hint={
                settings.spring === 'default'
                  ? undefined
                  : 'Used by the Default spring'
              }
            >
              <SegmentedControl
                options={SPEEDS}
                value={settings.duration}
                onChange={(duration) => set({ duration })}
              />
            </Setting>
          </View>
        </Tray.Body>
        <Tray.Footer style={s.actions}>
          <Tray.Close asChild>
            <PillButton label="Done" icon="checkmark" variant="primary" />
          </Tray.Close>
        </Tray.Footer>
      </Tray.Content>
    </Tray.Root>
  );
}

function SettingsButton({
  onPress,
  ref,
}: {
  onPress?: () => void;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel="Animation settings"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <SymbolView
        name="line.3.horizontal.decrease"
        size={17}
        weight="semibold"
        tintColor={playgroundColors.text}
      />
    </Pressable>
  );
}

function Setting({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.setting}>
      <View style={styles.settingLabel}>
        <Text style={[playgroundType.value, styles.label]}>{label}</Text>
        {!!hint && (
          <Text style={[playgroundType.caption, styles.hint]}>{hint}</Text>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: playgroundColors.card,
  },
  buttonPressed: {
    backgroundColor: playgroundColors.cardPressed,
  },
  setting: {
    gap: 10,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  label: {
    color: playgroundColors.text,
  },
  hint: {
    color: playgroundColors.label,
  },
});
