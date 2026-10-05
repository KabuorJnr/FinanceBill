import { memo, useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView, type SFSymbol } from '../symbol-view';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Tray, useTray } from 'morphlet';

import { AnimatedTabs } from '../artist/animated-tabs';
import { artistColors, artistType } from '../artist/artist.theme';
import {
  TrayButton,
  TrayGroup,
  TrayTextField,
  trayStyles,
} from '../artist/artist-tray-parts';
import type { IGame, IGameSave } from './game.data';
import { gameColors } from './game.theme';
import { GameActionButton } from './game-action-button';
import { GameTrayHeader } from './game-tray-parts';

type TDifficulty = 'story' | 'knight' | 'legend';

const DIFFICULTIES: {
  value: TDifficulty;
  label: string;
  icon: SFSymbol;
  description: string;
}[] = [
  {
    value: 'story',
    label: 'Story',
    icon: 'book.fill',
    description: 'Gentle foes and generous checkpoints. Made for exploring.',
  },
  {
    value: 'knight',
    label: 'Knight',
    icon: 'shield.lefthalf.filled',
    description: 'The intended challenge. Every parry counts.',
  },
  {
    value: 'legend',
    label: 'Legend',
    icon: 'crown.fill',
    description: 'One life per chapter. Enemies learn your moves.',
  },
];

const LOADING_MS = 2600;

interface ISession {
  hero: string;
  difficulty: TDifficulty;
  place: string;
}

const NEW_SESSION: ISession = { hero: '', difficulty: 'knight', place: '' };

export const PlayTray = memo(function PlayTray({ game }: { game: IGame }) {
  const [session, setSession] = useState(NEW_SESSION);

  return (
    <Tray.Root
      defaultView="start"
      onOpenChange={(open) => open && setSession(NEW_SESSION)}
    >
      <Tray.Trigger asChild morph>
        <GameActionButton label="Play" />
      </Tray.Trigger>

      <Tray.Content backgroundColor={gameColors.sheet}>
        <PlayHeader game={game} />
        <Tray.Body>
          <Tray.View name="start">
            <StartView game={game} onContinue={setSession} />
          </Tray.View>
          <Tray.View name="setup">
            <SetupView game={game} session={session} onChange={setSession} />
          </Tray.View>
          <Tray.View name="loading" fullScreen style={styles.fill}>
            <LoadingView game={game} session={session} />
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
});

function PlayHeader({ game }: { game: IGame }) {
  const { view } = useTray();
  if (view === 'loading') return null;

  return (
    <GameTrayHeader
      title={`Play ${game.title}`}
      subtitle={`${game.saves.length} saves · ${game.size}`}
      leading={
        <Image
          source={{ uri: game.avatar }}
          transition={200}
          style={styles.headerAvatar}
        />
      }
      views={{ setup: { title: 'New Game' } }}
    />
  );
}

interface IStartViewProps {
  game: IGame;
  onContinue: (session: ISession) => void;
}

function StartView({ game, onContinue }: IStartViewProps) {
  const { setView } = useTray();
  const resume = (save: IGameSave) => {
    onContinue({ ...NEW_SESSION, hero: 'Wanderer', place: save.place });
    setView('loading');
  };

  return (
    <View style={trayStyles.page}>
      <TrayGroup>
        {game.saves.map((save, index) => (
          <SaveRow
            key={save.id}
            save={save}
            latest={index === 0}
            onPress={() => resume(save)}
          />
        ))}
      </TrayGroup>

      <TrayButton
        label="New Game"
        icon="plus"
        variant="secondary"
        onPress={() => setView('setup')}
      />
    </View>
  );
}

interface ISaveRowProps {
  save: IGameSave;
  latest: boolean;
  onPress: () => void;
}

function SaveRow({ save, latest, onPress }: ISaveRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.save, pressed && trayStyles.rowPressed]}
    >
      <View style={[styles.saveIcon, latest && styles.saveIconLatest]}>
        <SymbolView
          name={latest ? 'play.fill' : 'clock.fill'}
          size={15}
          weight="bold"
          tintColor={latest ? gameColors.playLabel : artistColors.text}
        />
      </View>
      <View style={styles.saveText}>
        <Text style={artistType.title} numberOfLines={1}>
          {latest ? 'Continue' : save.place}
        </Text>
        <Text style={artistType.caption} numberOfLines={1}>
          {save.chapter} · {save.hours}h
        </Text>
      </View>
      <SymbolView
        name="chevron.right"
        size={13}
        weight="semibold"
        tintColor={artistColors.textTertiary}
      />
    </Pressable>
  );
}

interface ISetupViewProps {
  game: IGame;
  session: ISession;
  onChange: (session: ISession) => void;
}

function SetupView({ game, session, onChange }: ISetupViewProps) {
  const { setView } = useTray();
  const difficulty = DIFFICULTIES.find(
    (option) => option.value === session.difficulty
  )!;

  const begin = () => {
    Keyboard.dismiss();
    onChange({
      ...session,
      hero: session.hero.trim() || 'Wanderer',
      place: game.gallery[0]?.title ?? game.title,
    });
    setView('loading');
  };

  return (
    <View style={trayStyles.page}>
      <TrayGroup>
        <TrayTextField
          icon="person.fill"
          placeholder="Name your hero"
          value={session.hero}
          onChangeText={(hero) => onChange({ ...session, hero })}
          maxLength={18}
          autoCapitalize="words"
          returnKeyType="go"
          onSubmitEditing={begin}
        />
      </TrayGroup>

      <AnimatedTabs
        tabs={DIFFICULTIES}
        value={session.difficulty}
        onChange={(value) => onChange({ ...session, difficulty: value })}
      />

      <Tray.Morph value={difficulty.value} transition="slide">
        <Text style={[artistType.caption, styles.difficulty]}>
          {difficulty.description}
        </Text>
      </Tray.Morph>

      <TrayButton
        label="Begin Adventure"
        icon="figure.fencing"
        onPress={begin}
      />
    </View>
  );
}

interface ILoadingViewProps {
  game: IGame;
  session: ISession;
}

function LoadingView({ game, session }: ILoadingViewProps) {
  const { close } = useTray();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      350,
      withTiming(
        1,
        { duration: LOADING_MS, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) scheduleOnRN(close);
        }
      )
    );
  }, [progress, close]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.fill}>
      <Image
        source={{ uri: game.hero }}
        transition={300}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(26,26,26,0.2)', 'rgba(26,26,26,0.55)', gameColors.sheet]}
        locations={[0, 0.5, 0.9]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.loadingContent}>
        <Text style={styles.loadingEyebrow}>{session.place || game.title}</Text>
        <Tray.Title style={styles.loadingTitle}>
          Rise, {session.hero || 'Wanderer'}
        </Tray.Title>
        <Text style={artistType.caption}>
          Tip: hold to charge your blade, release just before an enemy strikes
          to parry.
        </Text>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, barStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: artistColors.card,
  },
  save: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  saveIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: artistColors.card,
  },
  saveIconLatest: {
    backgroundColor: gameColors.play,
  },
  saveText: {
    flex: 1,
    gap: 2,
  },
  difficulty: {
    paddingHorizontal: 4,
    lineHeight: 18,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  loadingEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: gameColors.star,
  },
  loadingTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: artistColors.text,
  },
  track: {
    height: 6,
    marginTop: 18,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: artistColors.card,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: gameColors.play,
  },
});
