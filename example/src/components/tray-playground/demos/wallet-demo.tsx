import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Tray, useTray } from 'morphlet';

import { fonts } from '../../../constants';
import { SymbolView, type SFSymbol } from '../../symbol-view';
import { TRAY_CONTENT, playgroundColors } from '../playground.theme';
import { AlertContent } from './alert-demo';

export function WalletDemo() {
  return (
    <>
      <WalletHeader />
      <Tray.Body>
        <Tray.View name="options">
          <OptionsView />
        </Tray.View>
        <Tray.View name="privateKey">
          <PrivateKeyView />
        </Tray.View>
        <Tray.View name="phrase">
          <PhraseView />
        </Tray.View>
        <Tray.View name="group" fullScreen>
          <GroupView />
        </Tray.View>
      </Tray.Body>
    </>
  );
}

const VIEW_ICONS: Record<string, SFSymbol> = {
  privateKey: 'creditcard',
  phrase: 'rectangle.grid.3x3',
  group: 'person.3.fill',
};

function WalletHeader() {
  const { view, goBack, canGoBack, close } = useTray();
  const icon = view ? VIEW_ICONS[view] : undefined;

  return (
    <Tray.Header style={styles.header}>
      <Tray.Morph value={view ?? ''} transition="scale">
        {icon ? (
          <SymbolView
            name={icon}
            size={32}
            weight="medium"
            tintColor={SECONDARY}
            style={styles.headerIcon}
          />
        ) : (
          <Tray.Title style={styles.headerTitle}>iCloud Backup</Tray.Title>
        )}
      </Tray.Morph>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={canGoBack ? 'Back' : 'Close'}
        hitSlop={8}
        onPress={canGoBack ? goBack : close}
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
      >
        <SymbolView
          name="xmark"
          size={14}
          weight="medium"
          tintColor="#8E8E93"
        />
      </Pressable>
    </Tray.Header>
  );
}

function OptionsView() {
  const { setView } = useTray();

  return (
    <View style={styles.options}>
      <View style={styles.divider} />
      <OptionRow
        icon="widget.large"
        title="View Private Key"
        onPress={() => setView('privateKey')}
      />
      <OptionRow
        icon="rectangle.grid.3x3"
        title="View Recovery Phrase"
        onPress={() => setView('phrase')}
      />
      <OptionRow
        icon="circle.grid.2x2.fill"
        title="View Backup Group"
        onPress={() => setView('group')}
      />

      <Tray.Root>
        <Tray.Trigger style={styles.remove}>
          <SymbolView
            name="exclamationmark.triangle"
            size={17}
            weight="medium"
            tintColor={playgroundColors.danger}
          />
          <Text style={[styles.rowText, styles.removeText]}>Remove Wallet</Text>
        </Tray.Trigger>
        <Tray.Content stack {...TRAY_CONTENT}>
          <AlertContent confirmLabel="Remove" />
        </Tray.Content>
      </Tray.Root>
    </View>
  );
}

interface IOptionRowProps {
  icon: SFSymbol;
  title: string;
  onPress: () => void;
}

function OptionRow({ icon, title, onPress }: IOptionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <SymbolView
        name={icon}
        size={18}
        weight="medium"
        tintColor={playgroundColors.text}
      />
      <Text style={styles.rowText}>{title}</Text>
    </Pressable>
  );
}

const BULLETS: { icon: SFSymbol; text: string }[] = [
  { icon: 'checkmark.shield', text: 'Keep your private key safe' },
  {
    icon: 'person.crop.circle.badge.xmark',
    text: 'Don’t share it with anyone else',
  },
  {
    icon: 'exclamationmark.triangle',
    text: 'If you lose it we can’t recover it',
  },
];

function PrivateKeyView() {
  const { goBack } = useTray();

  return (
    <View>
      <View style={styles.article}>
        <Text style={styles.title}>Private Key</Text>
        <Tray.Description style={styles.description}>
          Your Private Key is the key used to back up your wallet. Keep it
          secret and secure at all times.
        </Tray.Description>
        <View style={[styles.divider, styles.articleDivider]} />
        {BULLETS.map((bullet) => (
          <View key={bullet.text} style={styles.bullet}>
            <SymbolView name={bullet.icon} size={17} tintColor={SECONDARY} />
            <Text style={styles.bulletText}>{bullet.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <ActionButton label="Cancel" onPress={goBack} />
        <ActionButton label="Reveal" icon="faceid" primary onPress={goBack} />
      </View>
    </View>
  );
}

const WORDS = [
  'orbit',
  'velvet',
  'harbor',
  'lumen',
  'cobalt',
  'meadow',
  'quartz',
  'ember',
  'tundra',
  'saffron',
  'echo',
  'willow',
];

function PhraseView() {
  const { goBack } = useTray();

  return (
    <View>
      <View style={styles.article}>
        <Text style={styles.title}>Recovery Phrase</Text>
        <Tray.Description style={styles.description}>
          Write these 12 words down in order and store them somewhere safe.
        </Tray.Description>
        <View style={styles.words}>
          {WORDS.map((word, index) => (
            <View key={word} style={styles.word}>
              <Text style={styles.wordIndex}>{index + 1}</Text>
              <Text style={styles.wordText}>{word}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton label="I’ve Saved It" primary onPress={goBack} />
      </View>
    </View>
  );
}

const MEMBERS = [
  { name: 'Alex Morgan', device: 'iPhone 17 Pro' },
  { name: 'Sam Rivera', device: 'iPad Air' },
  { name: 'Jordan Lee', device: 'MacBook Pro' },
  { name: 'Riley Chen', device: 'iPhone Air' },
];

function GroupView() {
  const { goBack } = useTray();

  return (
    <View style={styles.groupPage}>
      <View style={styles.article}>
        <Text style={styles.title}>Backup Group</Text>
        <Tray.Description style={styles.description}>
          These people can help you recover your wallet. Any two of them can
          approve a recovery together.
        </Tray.Description>
      </View>

      <ScrollView contentContainerStyle={styles.members}>
        {MEMBERS.map((member) => (
          <View key={member.name} style={styles.member}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.name[0]}</Text>
            </View>
            <View style={styles.memberText}>
              <Text style={styles.rowText}>{member.name}</Text>
              <Text style={styles.memberDevice}>{member.device}</Text>
            </View>
            <SymbolView
              name="checkmark.seal.fill"
              size={20}
              tintColor={playgroundColors.success}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <ActionButton label="Back" onPress={goBack} />
        <ActionButton label="Invite" icon="person.badge.plus" primary />
      </View>
    </View>
  );
}

interface IActionButtonProps {
  label: string;
  icon?: SFSymbol;
  primary?: boolean;
  onPress?: () => void;
}

function ActionButton({ label, icon, primary, onPress }: IActionButtonProps) {
  const color = primary ? playgroundColors.inverse : playgroundColors.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary ? styles.actionPrimary : styles.actionSecondary,
        pressed && styles.actionPressed,
      ]}
    >
      {icon && <SymbolView name={icon} size={18} tintColor={color} />}
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const SECONDARY = '#8A8A8E';
const BLUE = '#007AFF';
const FAINT = 'rgba(0, 0, 0, 0.03)';
const DIVIDER = 'rgba(0, 0, 0, 0.05)';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontFamily: fonts.medium,
    fontSize: 19,
    includeFontPadding: false,
    color: playgroundColors.text,
  },
  headerIcon: {
    width: 40,
    height: 32,
    marginLeft: 8,
  },
  close: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: FAINT,
  },
  pressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
  },

  options: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  divider: {
    height: 1.5,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 8,
    backgroundColor: DIVIDER,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: FAINT,
  },
  rowPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  rowText: {
    fontFamily: fonts.medium,
    fontSize: 17,
    includeFontPadding: false,
    color: playgroundColors.text,
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  removeText: {
    color: playgroundColors.danger,
  },

  article: {
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 23,
    includeFontPadding: false,
    color: playgroundColors.text,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 22,
    includeFontPadding: false,
    color: SECONDARY,
  },
  articleDivider: {
    marginVertical: 13,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    includeFontPadding: false,
    color: SECONDARY,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
  },
  actionSecondary: {
    backgroundColor: DIVIDER,
  },
  actionPrimary: {
    backgroundColor: BLUE,
  },
  actionPressed: {
    opacity: 0.8,
  },
  actionText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    includeFontPadding: false,
  },

  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
  },
  word: {
    width: '31%',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: FAINT,
  },
  wordIndex: {
    fontFamily: fonts.regular,
    fontSize: 13,
    includeFontPadding: false,
    color: SECONDARY,
  },
  wordText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    includeFontPadding: false,
    color: playgroundColors.text,
  },

  groupPage: {
    flex: 1,
  },
  members: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: FAINT,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DIVIDER,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    includeFontPadding: false,
    color: playgroundColors.text,
  },
  memberText: {
    flex: 1,
    gap: 2,
  },
  memberDevice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    includeFontPadding: false,
    color: SECONDARY,
  },
});
