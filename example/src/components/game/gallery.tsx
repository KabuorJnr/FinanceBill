import {
  memo,
  useState,
  type ComponentRef,
  type ReactElement,
  type Ref,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type PressableProps,
} from 'react-native';
import { Image } from 'expo-image';
import { Tray } from 'morphlet';

import { artistColors, artistType } from '../artist/artist.theme';
import { TrayButton, trayStyles } from '../artist/artist-tray-parts';
import { ScalePressable } from '../artist/scale-pressable';
import type { IGameShot } from './game.data';
import { gameColors, gameLayout, gameType } from './game.theme';
import { GameTrayHeader } from './game-tray-parts';

const CARD_SHARE = 0.43;
const CARD_RATIO = 1.14;
const CARD_GAP = 14;
const VIEWER_HEIGHT = 250;

export const Gallery = memo(function Gallery({
  shots,
}: {
  shots: IGameShot[];
}) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.round(width * CARD_SHARE);

  return (
    <View style={styles.section}>
      <Text style={[gameType.section, styles.title]}>Gallery</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + CARD_GAP}
        contentContainerStyle={styles.shelf}
      >
        {shots.map((shot, index) => (
          <GalleryTray key={shot.id} shots={shots} initialIndex={index}>
            <ShotCard shot={shot} width={cardWidth} />
          </GalleryTray>
        ))}
      </ScrollView>
    </View>
  );
});

interface IShotCardProps extends Omit<PressableProps, 'style'> {
  shot: IGameShot;
  width: number;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

function ShotCard({ shot, width, ref, ...rest }: IShotCardProps) {
  return (
    <ScalePressable
      ref={ref}
      accessibilityRole="imagebutton"
      accessibilityLabel={shot.title}
      pressedScale={0.95}
      {...rest}
      style={[styles.card, { width, height: Math.round(width * CARD_RATIO) }]}
    >
      <Image
        source={{ uri: shot.uri }}
        transition={250}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.rim} pointerEvents="none" />
    </ScalePressable>
  );
}

interface IGalleryTrayProps {
  shots: IGameShot[];
  initialIndex: number;
  children: ReactElement;
}

function GalleryTray({ shots, initialIndex, children }: IGalleryTrayProps) {
  const [index, setIndex] = useState(initialIndex);
  const shot = shots[index]!;
  const step = (delta: number) =>
    setIndex((value) => (value + delta + shots.length) % shots.length);

  return (
    <Tray.Root onOpenChange={(open) => open && setIndex(initialIndex)}>
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>

      <Tray.Content backgroundColor={gameColors.sheet}>
        <GameTrayHeader
          title="Gallery"
          subtitle={`${index + 1} of ${shots.length}`}
        />
        <Tray.Body>
          <View style={trayStyles.page}>
            <Tray.Morph value={shot.id} style={styles.viewer}>
              <Image
                source={{ uri: shot.uri }}
                transition={150}
                style={styles.viewerImage}
              />
            </Tray.Morph>

            <Tray.Morph value={shot.id}>
              <View style={styles.caption}>
                <Text style={trayStyles.title}>{shot.title}</Text>
                <Tray.Description style={artistType.caption}>
                  {shot.caption}
                </Tray.Description>
              </View>
            </Tray.Morph>

            <View style={styles.dots}>
              {shots.map((item, dot) => (
                <View
                  key={item.id}
                  style={[styles.dot, dot === index && styles.dotActive]}
                />
              ))}
            </View>

            <View style={trayStyles.buttons}>
              <TrayButton
                label="Previous"
                icon="chevron.left"
                variant="secondary"
                onPress={() => step(-1)}
              />
              <TrayButton
                label="Next"
                icon="chevron.right"
                onPress={() => step(1)}
              />
            </View>
          </View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  title: {
    paddingHorizontal: gameLayout.gutter,
  },
  shelf: {
    gap: CARD_GAP,
    paddingHorizontal: gameLayout.gutter,
  },
  card: {
    borderRadius: gameLayout.galleryRadius,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: gameColors.surface,
  },
  rim: {
    ...StyleSheet.absoluteFill,
    borderRadius: gameLayout.galleryRadius,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  viewer: {
    height: VIEWER_HEIGHT,
    borderRadius: 22,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: artistColors.card,
  },
  viewerImage: {
    width: '100%',
    height: VIEWER_HEIGHT,
  },
  caption: {
    gap: 4,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: artistColors.textTertiary,
  },
  dotActive: {
    width: 18,
    backgroundColor: artistColors.text,
  },
});
