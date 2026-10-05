import { useEffect, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Tray, useTray } from 'morphlet';

import { SymbolView } from '../../symbol-view';
import {
  PillButton,
  PlaygroundTrayHeader,
  TrayBadge,
  playgroundTrayStyles as s,
} from '../playground-tray-parts';
import { playgroundColors, playgroundType } from '../playground.theme';

const TOPICS = ['Idea', 'Bug', 'Design', 'Praise'];
const RATING_WORDS = [
  '',
  'Not great',
  'Could be better',
  'Okay',
  'Good',
  'Love it',
];

export function KeyboardDemo() {
  const { open } = useTray();
  const [sent, setSent] = useState(false);
  const [rating, setRating] = useState(4);
  const [topic, setTopic] = useState('Idea');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      setSent(false);
      setMessage('');
    }
  }, [open]);

  return (
    <>
      <PlaygroundTrayHeader title={sent ? '' : 'Feedback'} />
      <Tray.Body>
        <Tray.Morph value={sent}>
          {sent ? (
            <ThanksView
              rating={rating}
              topic={topic}
              message={message}
              onAgain={() => {
                setMessage('');
                setSent(false);
              }}
            />
          ) : (
            <View style={s.page}>
              <View style={styles.rating}>
                <Stars value={rating} onChange={setRating} />
                <Tray.Morph value={rating} transition="scale">
                  <Text style={[playgroundType.caption, styles.ratingWord]}>
                    {RATING_WORDS[rating]}
                  </Text>
                </Tray.Morph>
              </View>

              <View style={styles.chips}>
                {TOPICS.map((option) => {
                  const isSelected = option === topic;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setTopic(option)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                    >
                      <Text
                        style={[
                          playgroundType.value,
                          styles.chipLabel,
                          isSelected && styles.chipLabelSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View>
                <TextInput
                  multiline
                  maxLength={200}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Tell us a little more…"
                  placeholderTextColor={playgroundColors.label}
                  selectionColor={playgroundColors.accent}
                  style={styles.input}
                />
                <Text style={[playgroundType.caption, styles.counter]}>
                  {message.length}/200
                </Text>
              </View>

              <PillButton
                label="Send Feedback"
                icon="paperplane.fill"
                variant="primary"
                onPress={() => {
                  Keyboard.dismiss();
                  setSent(true);
                }}
              />
            </View>
          )}
        </Tray.Morph>
      </Tray.Body>
    </>
  );
}

function Stars({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          disabled={!onChange}
          accessibilityRole="button"
          accessibilityLabel={`${star} stars`}
          hitSlop={4}
          onPress={() => onChange?.(star)}
        >
          <Tray.Morph value={star <= value} transition="scale">
            <SymbolView
              name={star <= value ? 'star.fill' : 'star'}
              size={size}
              tintColor={
                star <= value ? '#FFB800' : playgroundColors.cardPressed
              }
            />
          </Tray.Morph>
        </Pressable>
      ))}
    </View>
  );
}

interface IThanksViewProps {
  rating: number;
  topic: string;
  message: string;
  onAgain: () => void;
}

function ThanksView({ rating, topic, message, onAgain }: IThanksViewProps) {
  return (
    <View style={s.page}>
      <View style={[s.message, styles.thanks]}>
        <TrayBadge icon="sparkles" color={playgroundColors.accent} />
        <Tray.Title style={s.heading}>Thank you!</Tray.Title>
        <Tray.Description style={s.messageText}>
          We read every message. Your note goes straight to the team.
        </Tray.Description>
      </View>

      <View style={styles.receipt}>
        <View style={styles.receiptTop}>
          <Stars value={rating} size={16} />
          <View style={styles.tag}>
            <Text style={[playgroundType.caption, styles.tagLabel]}>
              {topic}
            </Text>
          </View>
        </View>
        <Text style={[playgroundType.body, styles.quote]} numberOfLines={3}>
          {message.trim() ? `“${message.trim()}”` : RATING_WORDS[rating]}
        </Text>
      </View>

      <View style={styles.row}>
        <PillButton label="Send Another" onPress={onAgain} />
        <Tray.Close asChild>
          <PillButton label="Done" variant="primary" />
        </Tray.Close>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rating: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingWord: {
    color: playgroundColors.label,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: playgroundColors.card,
  },
  chipSelected: {
    backgroundColor: playgroundColors.accentTint,
  },
  chipLabel: {
    fontSize: 15,
    color: playgroundColors.textSecondary,
  },
  chipLabelSelected: {
    color: playgroundColors.accent,
  },
  input: {
    ...playgroundType.body,
    minHeight: 104,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    borderRadius: 18,
    borderCurve: 'continuous',
    textAlignVertical: 'top',
    color: playgroundColors.text,
    backgroundColor: playgroundColors.card,
  },
  counter: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    fontVariant: ['tabular-nums'],
    color: playgroundColors.label,
  },
  thanks: {
    paddingTop: 0,
  },
  receipt: {
    gap: 10,
    padding: 16,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: playgroundColors.card,
  },
  receiptTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: playgroundColors.background,
  },
  tagLabel: {
    color: playgroundColors.textSecondary,
  },
  quote: {
    color: playgroundColors.text,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
