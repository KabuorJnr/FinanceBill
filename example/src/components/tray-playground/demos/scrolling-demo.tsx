import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Tray, useTray } from 'morphlet';

import { SymbolView } from '../../symbol-view';
import {
  PillButton,
  PlaygroundTrayHeader,
  playgroundTrayStyles as s,
} from '../playground-tray-parts';
import { playgroundColors, playgroundType } from '../playground.theme';
import { SegmentedControl } from '../segmented-control';

interface ITransaction {
  id: number;
  incoming: boolean;
  amount: number;
  name: string;
  day: string;
  time: string;
}

const NAMES = ['Alex', 'Sam', 'Jordan', 'Riley', 'Casey', 'Morgan', 'Taylor'];
const DAYS = ['Today', 'Yesterday', 'Monday', 'Last Week'];

const ACTIVITY: ITransaction[] = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  incoming: index % 3 === 0,
  amount: ((index * 37) % 100) / 10 + 0.1,
  name: NAMES[index % NAMES.length]!,
  day: DAYS[Math.min(Math.floor(index / 9), DAYS.length - 1)]!,
  time: `${9 + (index % 12)}:${String((index * 7) % 60).padStart(2, '0')}`,
}));

type TFilter = 'all' | 'in' | 'out';

const FILTERS: { value: TFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in', label: 'Received' },
  { value: 'out', label: 'Sent' },
];

export function ScrollingDemo() {
  const [selected, setSelected] = useState<ITransaction>(ACTIVITY[0]!);

  return (
    <>
      <PlaygroundTrayHeader
        views={{
          list: { title: 'Activity' },
          detail: { title: selected.incoming ? 'Received' : 'Sent' },
        }}
        accessory={<ExpandButton />}
      />
      <Tray.Body>
        <Tray.View name="list" style={styles.fill}>
          <ListView onSelect={setSelected} />
        </Tray.View>
        <Tray.View name="detail">
          <DetailView transaction={selected} />
        </Tray.View>
      </Tray.Body>
    </>
  );
}

function ListView({ onSelect }: { onSelect: (item: ITransaction) => void }) {
  const { setView, close } = useTray();
  const [filter, setFilter] = useState<TFilter>('all');

  const items = ACTIVITY.filter(
    (item) =>
      filter === 'all' || (filter === 'in' ? item.incoming : !item.incoming)
  );
  const sections = DAYS.map((day) => ({
    day,
    items: items.filter((item) => item.day === day),
  })).filter((section) => section.items.length > 0);

  return (
    <View style={styles.fill}>
      <View style={styles.filter}>
        <SegmentedControl
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      </View>

      <Tray.Morph value={filter} transition="scale" style={styles.fill}>
        <ScrollView contentContainerStyle={styles.list}>
          {sections.map((section) => (
            <View key={section.day}>
              <Text style={[playgroundType.caption, styles.sectionTitle]}>
                {section.day}
              </Text>
              {section.items.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => {
                    onSelect(item);
                    setView('detail');
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View
                    style={[styles.icon, item.incoming && styles.iconIncoming]}
                  >
                    <SymbolView
                      name={item.incoming ? 'arrow.down' : 'arrow.up'}
                      size={13}
                      weight="semibold"
                      tintColor={
                        item.incoming
                          ? playgroundColors.success
                          : playgroundColors.text
                      }
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[playgroundType.value, styles.title]}>
                      {item.incoming ? `From ${item.name}` : `To ${item.name}`}
                    </Text>
                    <Text style={[playgroundType.caption, styles.time]}>
                      {item.time}
                    </Text>
                  </View>
                  <Text
                    style={[
                      playgroundType.value,
                      styles.amount,
                      item.incoming && styles.amountIncoming,
                    ]}
                  >
                    {item.incoming ? '+' : '−'}
                    {item.amount.toFixed(2)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </Tray.Morph>

      <View style={s.actions}>
        <PillButton label="Done" onPress={close} />
      </View>
    </View>
  );
}

function DetailView({ transaction }: { transaction: ITransaction }) {
  const { goBack } = useTray();
  const facts = [
    { label: transaction.incoming ? 'From' : 'To', value: transaction.name },
    { label: 'Date', value: `${transaction.day}, ${transaction.time}` },
    { label: 'Network Fee', value: '0.0004 ETH' },
    { label: 'Status', value: 'Confirmed' },
  ];

  return (
    <View style={s.page}>
      <View style={styles.hero}>
        <Text style={[playgroundType.display, styles.heroAmount]}>
          {transaction.incoming ? '+' : '−'}
          {transaction.amount.toFixed(2)}
        </Text>
        <Text style={[playgroundType.label, styles.time]}>ETH</Text>
      </View>

      <View style={s.group}>
        {facts.map((fact, index) => (
          <View
            key={fact.label}
            style={[styles.fact, index > 0 && styles.factDivider]}
          >
            <Text style={[playgroundType.label, styles.time]}>
              {fact.label}
            </Text>
            <Text style={[playgroundType.value, styles.title]}>
              {fact.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <PillButton label="Back" onPress={goBack} />
        <PillButton
          label="Share"
          icon="square.and.arrow.up"
          variant="primary"
        />
      </View>
    </View>
  );
}

function ExpandButton() {
  const { fullScreen, setFullScreen } = useTray();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={fullScreen ? 'Collapse' : 'Expand'}
      hitSlop={8}
      onPress={() => setFullScreen(!fullScreen)}
      style={styles.expand}
    >
      <Tray.Morph value={fullScreen} transition="scale">
        <SymbolView
          name={
            fullScreen
              ? 'arrow.down.right.and.arrow.up.left'
              : 'arrow.up.left.and.arrow.down.right'
          }
          size={12}
          weight="bold"
          tintColor={playgroundColors.label}
        />
      </Tray.Morph>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flexShrink: 1,
  },
  filter: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    paddingTop: 14,
    paddingBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: playgroundColors.label,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderRadius: 14,
  },
  rowPressed: {
    opacity: 0.55,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: playgroundColors.card,
  },
  iconIncoming: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: playgroundColors.text,
  },
  time: {
    color: playgroundColors.label,
  },
  amount: {
    fontVariant: ['tabular-nums'],
    color: playgroundColors.text,
  },
  amountIncoming: {
    color: playgroundColors.success,
  },
  hero: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
  },
  heroAmount: {
    fontVariant: ['tabular-nums'],
    color: playgroundColors.text,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 18,
  },
  factDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: playgroundColors.separator,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  expand: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: playgroundColors.card,
  },
});
