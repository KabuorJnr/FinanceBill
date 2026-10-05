import { useCallback, useRef, useState, type ReactElement } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SymbolView } from '../symbol-view';
import { Tray, useTray } from 'morphlet';

import { fonts } from '../../constants';
import { ScalePressable } from '../artist/scale-pressable';
import {
  collectionColors,
  collectionType,
  FOLDER_TINTS,
} from './collections.theme';
import { useCollections } from './collections-store';
import type { TIcon } from './glass-surface';

export type TCollectionsTrayView = 'menu' | 'new';

type TFinish = (action?: () => void) => void;

const ICON_BUTTON_SIZE = 32;
const TILE_SIZE = 44;
const SWATCH_SIZE = 36;
const BUTTON_HEIGHT = 54;

interface ICollectionsTrayProps {
  children: ReactElement;
  defaultView?: TCollectionsTrayView;
  onViewAll?: () => void;
  onCreated?: () => void;
}

export function CollectionsTray({
  children,
  defaultView = 'menu',
  onViewAll,
  onCreated,
}: ICollectionsTrayProps) {
  const pending = useRef<(() => void) | undefined>(undefined);

  const runPending = useCallback(() => {
    const action = pending.current;
    pending.current = undefined;
    action?.();
  }, []);

  return (
    <Tray.Root defaultView={defaultView} transition="slide">
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>

      <Tray.Content
        backgroundColor={collectionColors.sheet}
        onDidDismiss={runPending}
      >
        <TrayHeading />
        <Tray.Body>
          <Tray.View name="menu">
            <TrayActions pending={pending} onViewAll={onViewAll} />
          </Tray.View>
          <Tray.View name="new">
            <NewFolderForm pending={pending} onCreated={onCreated} />
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

function useFinish(pending: { current: (() => void) | undefined }): TFinish {
  const { close } = useTray();
  return useCallback(
    (action) => {
      pending.current = action;
      close();
    },
    [close, pending]
  );
}

function TrayHeading() {
  const { view, goBack, canGoBack } = useTray();
  const isNew = view === 'new';

  return (
    <Tray.Header style={styles.header}>
      <Tray.Morph value={view ?? 'menu'} style={styles.heading}>
        <View style={styles.headingRow}>
          {isNew && canGoBack && (
            <HeaderButton
              icon={{ ios: 'chevron.left', android: 'arrow_back' }}
              label="Back"
              onPress={goBack}
            />
          )}
          <View style={styles.headingText}>
            <Tray.Title style={styles.title}>
              {isNew ? 'New folder' : 'Collections'}
            </Tray.Title>
            <Tray.Description style={styles.subtitle}>
              {isNew
                ? 'Name it, pick a color, invite later.'
                : 'Keep your memories together.'}
            </Tray.Description>
          </View>
        </View>
      </Tray.Morph>

      <Tray.Close
        accessibilityLabel="Close"
        hitSlop={8}
        style={styles.iconButton}
      >
        <SymbolView
          name={{ ios: 'xmark', android: 'close' }}
          size={13}
          weight="bold"
          tintColor={collectionColors.textSecondary}
        />
      </Tray.Close>
    </Tray.Header>
  );
}

interface IHeaderButtonProps {
  icon: TIcon;
  label: string;
  onPress: () => void;
}

function HeaderButton({ icon, label, onPress }: IHeaderButtonProps) {
  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      pressedScale={0.88}
      onPress={onPress}
      style={styles.iconButton}
    >
      <SymbolView
        name={icon}
        size={13}
        weight="bold"
        tintColor={collectionColors.textSecondary}
      />
    </ScalePressable>
  );
}

interface ITrayActionsProps {
  pending: { current: (() => void) | undefined };
  onViewAll?: () => void;
}

function TrayActions({ pending, onViewAll }: ITrayActionsProps) {
  const { setView } = useTray();
  const finish = useFinish(pending);
  const { collections } = useCollections();
  const count = `${collections.length} ${
    collections.length === 1 ? 'folder' : 'folders'
  }`;

  return (
    <View style={styles.page}>
      <View style={styles.group}>
        <ActionRow
          icon={{ ios: 'folder.fill', android: 'folder' }}
          tint={collectionColors.accent}
          title="View all folders"
          subtitle={count}
          onPress={() => finish(onViewAll)}
        />
        <View style={styles.divider} />
        <ActionRow
          icon={{ ios: 'folder.badge.plus', android: 'create_new_folder' }}
          tint="#E5484D"
          title="Add a new folder"
          subtitle="Start a fresh collection"
          navigates
          onPress={() => setView('new')}
        />
      </View>
    </View>
  );
}

interface IActionRowProps {
  icon: TIcon;
  tint: string;
  title: string;
  subtitle: string;
  navigates?: boolean;
  onPress: () => void;
}

function ActionRow({
  icon,
  tint,
  title,
  subtitle,
  navigates,
  onPress,
}: IActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.tile, { backgroundColor: `${tint}1F` }]}>
        <SymbolView name={icon} size={20} weight="semibold" tintColor={tint} />
      </View>
      <View style={styles.rowText}>
        <Text style={collectionType.body} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <SymbolView
        name={
          navigates
            ? { ios: 'chevron.right', android: 'chevron_right' }
            : { ios: 'arrow.up.right', android: 'north_east' }
        }
        size={13}
        weight="semibold"
        tintColor={collectionColors.textTertiary}
      />
    </Pressable>
  );
}

interface INewFolderFormProps {
  pending: { current: (() => void) | undefined };
  onCreated?: () => void;
}

function NewFolderForm({ pending, onCreated }: INewFolderFormProps) {
  const finish = useFinish(pending);
  const { addCollection } = useCollections();
  const [name, setName] = useState('');
  const [tint, setTint] = useState<string>(FOLDER_TINTS[0]);
  const canCreate = name.trim().length > 0;

  const create = () => {
    if (!canCreate) return;
    Keyboard.dismiss();
    addCollection(name.trim(), tint);
    finish(onCreated);
  };

  return (
    <View style={styles.page}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Folder name"
        placeholderTextColor={collectionColors.textTertiary}
        selectionColor={collectionColors.accent}
        keyboardAppearance="light"
        returnKeyType="done"
        onSubmitEditing={create}
        maxLength={40}
        style={[collectionType.body, styles.field]}
      />

      <View style={styles.swatches}>
        {FOLDER_TINTS.map((color) => {
          const selected = color === tint;
          return (
            <Pressable
              key={color}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`Folder color ${color}`}
              hitSlop={4}
              onPress={() => setTint(color)}
              style={[styles.swatchRing, selected && { borderColor: color }]}
            >
              <View style={[styles.swatch, { backgroundColor: color }]}>
                {selected && (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check' }}
                    size={14}
                    weight="bold"
                    tintColor="#FFFFFF"
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <ScalePressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canCreate }}
        disabled={!canCreate}
        onPress={create}
        style={[styles.button, !canCreate && styles.buttonDisabled]}
      >
        <Text style={collectionType.button}>Create folder</Text>
      </ScalePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 22,
    paddingHorizontal: 22,
  },
  heading: {
    flex: 1,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headingText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: collectionColors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: collectionColors.textSecondary,
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: ICON_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: collectionColors.field,
  },
  page: {
    gap: 16,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
  },
  group: {
    borderRadius: 22,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: collectionColors.field,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16 + TILE_SIZE + 14,
    backgroundColor: collectionColors.separator,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowPressed: {
    backgroundColor: collectionColors.fieldPressed,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: collectionColors.textSecondary,
  },
  field: {
    height: 54,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: collectionColors.field,
  },
  swatches: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  swatchRing: {
    padding: 3,
    borderRadius: SWATCH_SIZE,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BUTTON_HEIGHT / 2,
    backgroundColor: collectionColors.accent,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
