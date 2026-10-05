import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Tray, useTray } from 'morphlet';

import { SymbolView, type SFSymbol } from '../../symbol-view';
import { CircleButton, PillButton } from '../playground-tray-parts';
import { playgroundColors, playgroundType } from '../playground.theme';

const STEPS = ['welcome', 'permissions', 'appearance', 'ready'] as const;

export function FullScreenDemo() {
  return (
    <>
      <Header />
      <Tray.Body>
        <Tray.View name="welcome">
          <Step
            icon="sparkles"
            color={playgroundColors.accent}
            title="Room to breathe"
            body="Trays can take over the whole screen when there’s more to say. Each step morphs into the next, just like a floating tray."
          />
        </Tray.View>
        <Tray.View name="permissions">
          <Step
            icon="bolt.fill"
            color="#FF9500"
            title="Stay in the loop"
            body="Pick what we can help with. You can change these later in Settings."
          >
            <Permissions />
          </Step>
        </Tray.View>
        <Tray.View name="appearance">
          <Step
            icon="paintpalette.fill"
            color="#AF52DE"
            title="Make it yours"
            body="Choose how the app looks."
          >
            <Appearance />
          </Step>
        </Tray.View>
        <Tray.View name="ready">
          <Step
            icon="checkmark.seal.fill"
            color={playgroundColors.success}
            title="You’re all set"
            body="That’s everything. Closing a full-screen tray folds it back down, the same as any other."
          />
        </Tray.View>
      </Tray.Body>
      <Footer />
    </>
  );
}

function useStep() {
  const tray = useTray();
  const index = Math.max(0, STEPS.indexOf(tray.view as (typeof STEPS)[number]));
  return { ...tray, index, isLast: index === STEPS.length - 1 };
}

function Header() {
  const { index, isLast, goBack, canGoBack, close, setView } = useStep();

  return (
    <Tray.Header style={styles.header}>
      <CircleButton
        icon={canGoBack ? 'chevron.left' : 'xmark'}
        label={canGoBack ? 'Back' : 'Close'}
        onPress={canGoBack ? goBack : close}
      />
      <View style={styles.progress}>
        {STEPS.map((step, i) => (
          <View key={step} style={[styles.dash, i <= index && styles.dashOn]} />
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        disabled={isLast}
        onPress={() => setView('ready')}
        style={[styles.skip, isLast && styles.hidden]}
      >
        <Text style={[playgroundType.value, styles.skipLabel]}>Skip</Text>
      </Pressable>
    </Tray.Header>
  );
}

function Footer() {
  const { index, isLast, setView, close } = useStep();

  return (
    <Tray.Footer style={styles.footer}>
      <Tray.Morph value={isLast} transition="scale" style={styles.grow}>
        <PillButton
          label={isLast ? 'Get Started' : 'Continue'}
          icon={isLast ? 'checkmark.circle.fill' : 'circle.dotted'}
          variant="primary"
          onPress={() => (isLast ? close() : setView(STEPS[index + 1]!))}
        />
      </Tray.Morph>
    </Tray.Footer>
  );
}

interface IStepProps {
  icon: SFSymbol;
  color: string;
  title: string;
  body: string;
  children?: ReactNode;
}

function Step({ icon, color, title, body, children }: IStepProps) {
  return (
    <View style={styles.step}>
      <View style={[styles.tile, { backgroundColor: `${color}1A` }]}>
        <SymbolView name={icon} size={34} weight="semibold" tintColor={color} />
      </View>
      <Tray.Title style={styles.title}>{title}</Tray.Title>
      <Tray.Description style={styles.text}>{body}</Tray.Description>
      {children}
    </View>
  );
}

const PERMISSIONS: { icon: SFSymbol; label: string; detail: string }[] = [
  {
    icon: 'envelope.fill',
    label: 'Notifications',
    detail: 'Replies and mentions',
  },
  { icon: 'location.fill', label: 'Location', detail: 'Nearby events' },
  { icon: 'faceid', label: 'Face ID', detail: 'Unlock without a code' },
];

function Permissions() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    Notifications: true,
  });

  return (
    <View style={styles.card}>
      {PERMISSIONS.map((item, index) => (
        <View
          key={item.label}
          style={[styles.permission, index > 0 && styles.divider]}
        >
          <SymbolView
            name={item.icon}
            size={18}
            tintColor={playgroundColors.text}
          />
          <View style={styles.permissionText}>
            <Text style={[playgroundType.value, styles.textPrimary]}>
              {item.label}
            </Text>
            <Text style={[playgroundType.caption, styles.muted]}>
              {item.detail}
            </Text>
          </View>
          <Switch
            value={!!enabled[item.label]}
            onValueChange={(value) =>
              setEnabled((current) => ({ ...current, [item.label]: value }))
            }
            trackColor={{ true: playgroundColors.accent }}
          />
        </View>
      ))}
    </View>
  );
}

const THEMES: { value: string; label: string; icon: SFSymbol }[] = [
  { value: 'light', label: 'Light', icon: 'leaf.fill' },
  { value: 'dark', label: 'Dark', icon: 'moon.stars.fill' },
  { value: 'auto', label: 'Auto', icon: 'circle.grid.2x2.fill' },
];

function Appearance() {
  const [theme, setTheme] = useState('auto');

  return (
    <View style={styles.themes}>
      {THEMES.map((option) => {
        const isSelected = option.value === theme;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => setTheme(option.value)}
            style={[styles.theme, isSelected && styles.themeSelected]}
          >
            <SymbolView
              name={option.icon}
              size={22}
              tintColor={
                isSelected ? playgroundColors.accent : playgroundColors.label
              }
            />
            <Text
              style={[
                playgroundType.value,
                isSelected ? styles.themeLabelSelected : styles.muted,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
  },
  dash: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: playgroundColors.card,
  },
  dashOn: {
    backgroundColor: playgroundColors.accent,
  },
  skip: {
    minWidth: 30,
    alignItems: 'flex-end',
  },
  skipLabel: {
    color: playgroundColors.label,
  },
  hidden: {
    opacity: 0,
  },
  step: {
    gap: 14,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  tile: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    ...playgroundType.display,
    fontSize: 32,
    color: playgroundColors.text,
  },
  text: {
    ...playgroundType.body,
    fontSize: 17,
    lineHeight: 25,
    color: playgroundColors.textSecondary,
  },
  card: {
    marginTop: 10,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: playgroundColors.card,
  },
  permission: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: playgroundColors.separator,
  },
  permissionText: {
    flex: 1,
    gap: 2,
  },
  textPrimary: {
    color: playgroundColors.text,
  },
  muted: {
    color: playgroundColors.label,
  },
  themes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  theme: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: playgroundColors.card,
  },
  themeSelected: {
    borderColor: playgroundColors.accent,
    backgroundColor: playgroundColors.accentTint,
  },
  themeLabelSelected: {
    color: playgroundColors.accent,
  },
  grow: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
});
