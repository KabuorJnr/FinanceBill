import { memo, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView, type SFSymbol } from '../symbol-view';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Tray, useTray } from 'morphlet';

import { AnimatedTabs } from '../artist/animated-tabs';
import { artistColors, artistType } from '../artist/artist.theme';
import { TrayButton, trayStyles } from '../artist/artist-tray-parts';
import type { IGame } from './game.data';
import { gameColors } from './game.theme';
import { GameActionButton } from './game-action-button';
import {
  GameTrayHeader,
  TrayBadge,
  TrayChips,
  TrayTextArea,
} from './game-tray-parts';

type TArtStyle = 'pixel' | 'painted' | 'neon';

const ART_STYLES: { value: TArtStyle; label: string; icon: SFSymbol }[] = [
  { value: 'pixel', label: 'Pixel', icon: 'square.grid.3x3.fill' },
  { value: 'painted', label: 'Painted', icon: 'paintpalette.fill' },
  { value: 'neon', label: 'Neon', icon: 'bolt.fill' },
];

const STYLE_TINTS: Record<TArtStyle, string> = {
  pixel: 'transparent',
  painted: 'rgba(255, 170, 60, 0.18)',
  neon: 'rgba(170, 60, 255, 0.32)',
};

const IDEAS = [
  {
    value: 'Make it night with fireflies',
    label: 'Night mode',
    icon: 'moon.stars.fill',
  },
  {
    value: 'Add a speedrun timer and ghost',
    label: 'Speedrun',
    icon: 'stopwatch.fill',
  },
  {
    value: 'Two-player co-op with a friend',
    label: 'Co-op',
    icon: 'person.2.fill',
  },
  {
    value: 'Every enemy is a giant mushroom',
    label: 'Mushrooms',
    icon: 'leaf.fill',
  },
] as const satisfies { value: string; label: string; icon: SFSymbol }[];

const MAX_PROMPT = 160;

const STEPS = [
  'Reading your idea',
  'Rebuilding the levels',
  'Repainting the world',
  'Balancing the blade',
];
const STEP_MS = 650;

interface IRemix {
  prompt: string;
  style: TArtStyle;
}

const EMPTY_REMIX: IRemix = { prompt: '', style: 'pixel' };

export const RemixTray = memo(function RemixTray({ game }: { game: IGame }) {
  const [remix, setRemix] = useState(EMPTY_REMIX);

  return (
    <Tray.Root
      defaultView="prompt"
      onOpenChange={(open) => open && setRemix(EMPTY_REMIX)}
    >
      <Tray.Trigger asChild morph>
        <GameActionButton label="Remix" variant="secondary" />
      </Tray.Trigger>

      <Tray.Content backgroundColor={gameColors.sheet}>
        <GameTrayHeader
          title={`Remix ${game.title}`}
          subtitle="Describe your twist on the game"
          leading={<TrayBadge icon="wand.and.stars" color={gameColors.star} />}
          views={{
            generating: { title: 'Remixing…', back: false },
            ready: { title: 'Your Remix', back: false },
          }}
        />
        <Tray.Body>
          <Tray.View name="prompt">
            <PromptView remix={remix} onChange={setRemix} />
          </Tray.View>
          <Tray.View name="generating">
            <GeneratingView />
          </Tray.View>
          <Tray.View name="ready">
            <ReadyView game={game} remix={remix} />
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
});

interface IPromptViewProps {
  remix: IRemix;
  onChange: (remix: IRemix) => void;
}

function PromptView({ remix, onChange }: IPromptViewProps) {
  const { setView } = useTray();
  const canGenerate = remix.prompt.trim().length > 0;

  return (
    <View style={trayStyles.page}>
      <TrayTextArea
        placeholder="e.g. Turn the kingdom into a frozen wasteland…"
        value={remix.prompt}
        onChangeText={(prompt) => onChange({ ...remix, prompt })}
        maxLength={MAX_PROMPT}
        counter={`${remix.prompt.length}/${MAX_PROMPT}`}
        submitBehavior="blurAndSubmit"
        returnKeyType="done"
      />

      <View style={styles.block}>
        <Text style={styles.label}>Ideas</Text>
        <TrayChips
          options={IDEAS}
          selected={IDEAS.filter((idea) => idea.value === remix.prompt).map(
            (idea) => idea.value
          )}
          onPress={(prompt) => onChange({ ...remix, prompt })}
        />
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Art style</Text>
        <AnimatedTabs
          tabs={ART_STYLES}
          value={remix.style}
          onChange={(style) => onChange({ ...remix, style })}
        />
      </View>

      <View style={!canGenerate && styles.disabled}>
        <TrayButton
          label="Generate Remix"
          icon="sparkles"
          onPress={() => {
            if (!canGenerate) return;
            Keyboard.dismiss();
            setView('generating');
          }}
        />
      </View>
    </View>
  );
}

function GeneratingView() {
  const { setView } = useTray();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length) {
      const done = setTimeout(() => setView('ready'), 350);
      return () => clearTimeout(done);
    }
    const next = setTimeout(() => setStep((value) => value + 1), STEP_MS);
    return () => clearTimeout(next);
  }, [step, setView]);

  return (
    <View style={[trayStyles.page, styles.generating]}>
      <SpinningSparkle />
      <View style={styles.steps}>
        {STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <View key={label} style={styles.step}>
              <SymbolView
                name={done ? 'checkmark.circle.fill' : 'circle.dotted'}
                size={18}
                weight="semibold"
                tintColor={
                  done
                    ? gameColors.star
                    : active
                      ? artistColors.text
                      : artistColors.textTertiary
                }
              />
              <Text
                style={[
                  artistType.body,
                  !done && !active && { color: artistColors.textTertiary },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SpinningSparkle() {
  const turn = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    turn.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.linear }),
      -1
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );
  }, [turn, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turn.value * 360}deg` }, { scale: pulse.value }],
  }));

  return (
    <Animated.View style={[styles.sparkle, animatedStyle]}>
      <SymbolView
        name="sparkles"
        size={34}
        weight="semibold"
        tintColor={gameColors.star}
      />
    </Animated.View>
  );
}

function ReadyView({ game, remix }: { game: IGame; remix: IRemix }) {
  const { close, setView } = useTray();
  const style = ART_STYLES.find((option) => option.value === remix.style)!;

  return (
    <View style={trayStyles.page}>
      <View style={styles.preview}>
        <Image
          source={{ uri: game.hero }}
          transition={200}
          style={styles.previewImage}
          blurRadius={remix.style === 'painted' ? 2 : 0}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: STYLE_TINTS[remix.style] },
          ]}
        />
        <View style={styles.previewBadge}>
          <SymbolView
            name={style.icon}
            size={12}
            weight="bold"
            tintColor={gameColors.playLabel}
          />
          <Text style={styles.previewBadgeLabel}>{style.label}</Text>
        </View>
      </View>

      <View style={styles.block}>
        <Text style={trayStyles.title} numberOfLines={1}>
          {game.title}: Remixed
        </Text>
        <Text style={artistType.caption} numberOfLines={2}>
          “{remix.prompt.trim()}”
        </Text>
      </View>

      <View style={trayStyles.buttons}>
        <TrayButton
          label="Edit"
          icon="pencil"
          variant="secondary"
          onPress={() => setView('prompt')}
        />
        <TrayButton label="Play Remix" icon="play.fill" onPress={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: artistColors.textTertiary,
  },
  disabled: {
    opacity: 0.4,
  },
  generating: {
    alignItems: 'center',
    gap: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  sparkle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 165, 36, 0.14)',
  },
  steps: {
    alignSelf: 'stretch',
    gap: 14,
    paddingHorizontal: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preview: {
    height: 180,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: artistColors.card,
  },
  previewImage: {
    flex: 1,
  },
  previewBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: gameColors.play,
  },
  previewBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: gameColors.playLabel,
  },
});
