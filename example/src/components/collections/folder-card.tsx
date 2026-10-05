import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-backdrop';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';

import { isGlassSupported, withAlpha } from '../../utils';
import { collectionColors, collectionLayout } from './collections.theme';
import { GlassIconButton } from './glass-surface';

const PHOTO_SLOTS = [
  { left: 0.02, top: 0.08, width: 0.33, rotate: '-4deg' },
  { left: 0.29, top: 0.05, width: 0.27, rotate: '3deg' },
  { left: 0.5, top: 0.09, width: 0.23, rotate: '-2deg' },
  { left: 0.64, top: 0.04, width: 0.35, rotate: '4deg' },
] as const;
const PHOTO_HEIGHT = 0.72;
const POCKET_SHARE = 0.58;
const RADIUS = collectionLayout.folderRadius;

interface IFolderCardProps {
  width: number;
  tint: string;
  photos: string[];
  onAddPress?: () => void;
}

export const FolderCard = memo(function FolderCard({
  width,
  tint,
  photos,
  onAddPress,
}: IFolderCardProps) {
  const height = Math.round(width * collectionLayout.folderAspect);
  const pocketHeight = Math.round(height * POCKET_SHARE);

  return (
    <View
      style={[
        styles.sleeve,
        { width, height, backgroundColor: withAlpha(tint, 0.32) },
      ]}
    >
      {PHOTO_SLOTS.map((slot, index) => {
        const uri = photos[index];
        const frame = {
          left: slot.left * width,
          top: slot.top * height,
          width: slot.width * width,
          height: PHOTO_HEIGHT * height,
          transform: [{ rotate: slot.rotate }],
        };
        return uri ? (
          <Image
            key={index}
            source={{ uri }}
            transition={250}
            contentFit="cover"
            style={[styles.photo, frame]}
          />
        ) : (
          <View key={index} style={[styles.photo, styles.emptyPhoto, frame]} />
        );
      })}

      <FolderPocket tint={tint} height={pocketHeight}>
        <GlassIconButton
          icon={{ ios: 'plus', android: 'add' }}
          label="Add memories"
          size={42}
          iconSize={19}
          onPress={onAddPress}
        />
      </FolderPocket>
    </View>
  );
});

interface IFolderPocketProps {
  tint: string;
  height: number;
  children: ReactNode;
}

function FolderPocket({ tint, height, children }: IFolderPocketProps) {
  const frame = [styles.pocket, { height }];

  return (
    <View style={frame}>
      {isGlassSupported ? (
        <GlassView
          glassEffectStyle="regular"
          tintColor={withAlpha(tint, 0.5)}
          colorScheme="light"
          style={[StyleSheet.absoluteFill, styles.pocketShape]}
        />
      ) : (
        <BlurView
          intensity={70}
          tintColor={withAlpha(tint, 0.48)}
          cornerRadius={RADIUS}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.lip]}
      />
      <View style={styles.pocketContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sleeve: {
    borderRadius: RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  photo: {
    position: 'absolute',
    borderRadius: 18,
    borderCurve: 'continuous',
    borderWidth: 2.5,
    borderColor: collectionColors.photoBorder,
    backgroundColor: collectionColors.fieldPressed,
  },
  emptyPhoto: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  pocket: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  pocketShape: {
    borderRadius: RADIUS,
    borderCurve: 'continuous',
  },
  lip: {
    borderRadius: RADIUS,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  pocketContent: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
});
