import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from '../symbol-view';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Tray, useTray } from 'morphlet';

import { artistColors, artistType } from '../artist/artist.theme';
import { TrayButton, trayStyles } from '../artist/artist-tray-parts';
import { gameColors } from './game.theme';
import { TrayTextArea } from './game-tray-parts';
import { StarPicker } from './stars';

const MAX_REVIEW = 280;
const RATING_LABELS = [
  'Tap to rate',
  'Not for me',
  'Okay',
  'Good',
  'Great',
  'Loved it',
];

interface IComposeViewProps {
  onSubmit: (rating: number, text: string) => void;
}

export function ComposeView({ onSubmit }: IComposeViewProps) {
  const { setView } = useTray();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const canSubmit = rating > 0;

  return (
    <View style={trayStyles.page}>
      <View style={styles.rating}>
        <StarPicker value={rating} onChange={setRating} />
        <Tray.Morph value={rating} transition="fade">
          <Text style={[artistType.captionStrong, styles.ratingLabel]}>
            {RATING_LABELS[rating]}
          </Text>
        </Tray.Morph>
      </View>

      <TrayTextArea
        placeholder="What did you think? (optional)"
        value={text}
        onChangeText={setText}
        maxLength={MAX_REVIEW}
        counter={`${text.length}/${MAX_REVIEW}`}
      />

      <View style={!canSubmit && styles.disabled}>
        <TrayButton
          label="Post Review"
          icon="paperplane.fill"
          onPress={() => {
            if (!canSubmit) return;
            Keyboard.dismiss();
            onSubmit(rating, text.trim());
            setView('thanks');
          }}
        />
      </View>
    </View>
  );
}

export function ThanksView({ message }: { message: string }) {
  const scale = useSharedValue(0.4);
  useEffect(() => {
    scale.value = withDelay(
      120,
      withSpring(1, { stiffness: 320, damping: 12 })
    );
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[trayStyles.page, styles.thanks]}>
      <Animated.View style={[styles.check, animatedStyle]}>
        <SymbolView
          name="checkmark"
          size={30}
          weight="heavy"
          tintColor={gameColors.playLabel}
        />
      </Animated.View>
      <Tray.Description style={[artistType.body, styles.thanksText]}>
        {message}
      </Tray.Description>
      <Tray.Close asChild>
        <TrayButton label="Done" variant="secondary" />
      </Tray.Close>
    </View>
  );
}

const styles = StyleSheet.create({
  rating: {
    alignItems: 'center',
    gap: 2,
  },
  ratingLabel: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  thanks: {
    alignItems: 'stretch',
    gap: 18,
    paddingTop: 24,
  },
  check: {
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: gameColors.star,
  },
  thanksText: {
    textAlign: 'center',
    color: artistColors.textSecondary,
  },
});
