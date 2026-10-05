import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Tray, useTray } from 'morphlet';

import { fonts } from '../../../constants';
import { SymbolView, type SFSymbol } from '../../symbol-view';
import { playgroundColors } from '../playground.theme';

const SECONDARY = '#8A8A8E';
const FAINT = 'rgba(0, 0, 0, 0.03)';
const SOFT = 'rgba(0, 0, 0, 0.05)';
const RED = '#FF3B30';
const GREEN = '#34C759';

export function AlertContent({ confirmLabel }: { confirmLabel: string }) {
  return (
    <>
      <AlertHeader icon="exclamationmark.circle" color={RED} />
      <Tray.Body>
        <Message
          title="Are you sure?"
          text="You haven’t backed up your wallet yet. If you remove it, you could lose access forever."
        />
        <Actions>
          <Tray.Close asChild>
            <Button label="Cancel" />
          </Tray.Close>
          <Tray.Close asChild>
            <Button label={confirmLabel} color={RED} />
          </Tray.Close>
        </Actions>
      </Tray.Body>
    </>
  );
}

const ICONS: Record<string, { icon: SFSymbol; color: string }> = {
  confirm: { icon: 'exclamationmark.circle', color: RED },
  deleting: { icon: 'clock.fill', color: SECONDARY },
  deleted: { icon: 'checkmark.circle.fill', color: GREEN },
  archived: { icon: 'folder.fill', color: SECONDARY },
};

export function AlertDemo() {
  const { view } = useTray();
  const header = ICONS[view ?? 'confirm'] ?? ICONS.confirm!;

  return (
    <>
      <AlertHeader
        icon={header.icon}
        color={header.color}
        morphKey={view}
        closable={view !== 'deleting'}
      />
      <Tray.Body>
        <Tray.View name="confirm">
          <ConfirmView />
        </Tray.View>
        <Tray.View name="deleting">
          <DeletingView />
        </Tray.View>
        <Tray.View name="deleted">
          <ResultView
            title="Playlist deleted"
            text="“Late Night Drive” is gone. You can still undo this for a few seconds."
          />
        </Tray.View>
        <Tray.View name="archived">
          <ResultView
            title="Moved to archive"
            text="“Late Night Drive” is hidden from your library. Bring it back anytime."
          />
        </Tray.View>
      </Tray.Body>
    </>
  );
}

interface IAlertHeaderProps {
  icon: SFSymbol;
  color: string;
  morphKey?: string;
  closable?: boolean;
}

function AlertHeader({
  icon,
  color,
  morphKey = '',
  closable = true,
}: IAlertHeaderProps) {
  return (
    <Tray.Header style={styles.header}>
      <Tray.Morph value={morphKey} transition="scale">
        <SymbolView
          name={icon}
          size={34}
          weight="medium"
          tintColor={color}
          style={styles.icon}
        />
      </Tray.Morph>
      <Tray.Close asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          disabled={!closable}
          style={({ pressed }) => [
            styles.close,
            pressed && styles.closePressed,
            !closable && styles.hidden,
          ]}
        >
          <SymbolView
            name="xmark"
            size={14}
            weight="medium"
            tintColor="#8E8E93"
          />
        </Pressable>
      </Tray.Close>
    </Tray.Header>
  );
}

function ConfirmView() {
  const { setView } = useTray();

  return (
    <View>
      <Message
        title="Delete playlist?"
        text="“Late Night Drive” and its 42 songs will be removed from all your devices."
      />
      <Actions>
        <Tray.Close asChild>
          <Button label="Cancel" />
        </Tray.Close>
        <Button
          label="Delete"
          color={RED}
          onPress={() => setView('deleting')}
        />
      </Actions>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setView('archived')}
        style={styles.link}
      >
        <Text style={styles.linkText}>Archive instead</Text>
      </Pressable>
    </View>
  );
}

const DELETE_MS = 1600;

function DeletingView() {
  const { setView } = useTray();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: DELETE_MS,
      easing: Easing.inOut(Easing.cubic),
    });
    const timer = setTimeout(() => setView('deleted'), DELETE_MS + 150);
    return () => clearTimeout(timer);
  }, [progress, setView]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.deleting}>
      <Message title="Deleting…" text="Removing 42 songs from your library." />
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

function ResultView({ title, text }: { title: string; text: string }) {
  const { setView } = useTray();

  return (
    <View>
      <Message title={title} text={text} />
      <Actions>
        <Button label="Undo" onPress={() => setView('confirm')} />
        <Tray.Close asChild>
          <Button label="Done" color={playgroundColors.text} />
        </Tray.Close>
      </Actions>
    </View>
  );
}

function Message({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.message}>
      <Tray.Title style={styles.title}>{title}</Tray.Title>
      <Tray.Description style={styles.text}>{text}</Tray.Description>
    </View>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <View style={styles.actions}>{children}</View>;
}

interface IButtonProps {
  label: string;
  color?: string;
  onPress?: () => void;
}

function Button({ label, color, onPress }: IButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color ?? SOFT },
        pressed && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          { color: color ? playgroundColors.inverse : playgroundColors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  icon: {
    width: 34,
    height: 34,
    marginLeft: 8,
  },
  close: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: FAINT,
  },
  closePressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
  },
  hidden: {
    opacity: 0,
  },
  message: {
    gap: 10,
    paddingHorizontal: 32,
    paddingTop: 18,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 23,
    includeFontPadding: false,
    color: playgroundColors.text,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 22,
    includeFontPadding: false,
    color: SECONDARY,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    includeFontPadding: false,
  },
  link: {
    alignSelf: 'center',
    marginTop: -8,
    paddingBottom: 22,
  },
  linkText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    includeFontPadding: false,
    color: SECONDARY,
  },
  deleting: {
    paddingBottom: 32,
  },
  track: {
    height: 4,
    marginTop: 22,
    marginHorizontal: 32,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: SOFT,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: playgroundColors.text,
  },
});
