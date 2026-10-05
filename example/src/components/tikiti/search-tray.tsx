import {
  useState,
  type ComponentRef,
  type ReactElement,
  type Ref,
} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
} from 'react-native';
import { Tray } from 'morphlet';

import { SymbolView } from '../symbol-view';
import { EventTray } from './event-tray';
import { categoryOf, displayName, type IEvent } from './events.data';
import { useEvents } from './events.store';
import { formatPrice, formatTime } from './tikiti.data';
import { lowestPrice } from './events.data';
import { DateBlock, TikitiHeader, tikitiType } from './tikiti-parts';
import { TIKITI_TRAY_CONTENT, tikitiColors } from './tikiti.theme';

function matches(event: IEvent, term: string) {
  return [
    event.title,
    displayName(event),
    event.venue.name,
    event.venue.area,
    event.venue.city.name,
    event.organizer.name,
    categoryOf(event.category).label,
    ...event.lineup,
  ].some((text) => text.toLowerCase().includes(term));
}

export function SearchTray({ children }: { children: ReactElement }) {
  const { events } = useEvents();
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const results = term ? events.filter((event) => matches(event, term)) : [];

  return (
    <Tray.Root onOpenChange={(open) => open && setQuery('')}>
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>

      <Tray.Content {...TIKITI_TRAY_CONTENT}>
        <TikitiHeader views={{}} />
        <Tray.Body>
          <View style={styles.page}>
            <View style={styles.field}>
              <SymbolView
                name="magnifyingglass"
                size={16}
                weight="semibold"
                tintColor={tikitiColors.textSecondary}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Artists, events, venues, cities"
                placeholderTextColor={tikitiColors.textTertiary}
                selectionColor={tikitiColors.accentBright}
                keyboardAppearance="dark"
                returnKeyType="search"
                autoCorrect={false}
                autoFocus
                style={[tikitiType.body, styles.input]}
              />
            </View>

            <Tray.Morph value={term ? 'results' : 'empty'} transition="fade">
              {!term ? (
                <Text style={[tikitiType.caption, styles.hint]}>
                  Try “Nyota”, “Mombasa”, “comedy” or “Kasarani”.
                </Text>
              ) : results.length === 0 ? (
                <Text style={[tikitiType.caption, styles.hint]}>
                  Hakuna matokeo. No events match “{query.trim()}”.
                </Text>
              ) : (
                <ScrollView
                  style={styles.list}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.group}>
                    {results.map((event, index) => (
                      <EventTray key={event.id} events={[event]} stack>
                        <ResultRow event={event} divider={index > 0} />
                      </EventTray>
                    ))}
                  </View>
                </ScrollView>
              )}
            </Tray.Morph>
          </View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

interface IResultRowProps extends Omit<PressableProps, 'style'> {
  event: IEvent;
  divider: boolean;
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

function ResultRow({ event, divider, ref, ...rest }: IResultRowProps) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        styles.row,
        divider && styles.divider,
        pressed && styles.pressed,
      ]}
    >
      <DateBlock date={event.date} />
      <View style={styles.text}>
        <Text style={tikitiType.headline} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={tikitiType.caption} numberOfLines={1}>
          {event.venue.name}, {event.venue.city.name} · {formatTime(event.time)}
        </Text>
      </View>
      <Text style={[tikitiType.caption, styles.price]}>
        {formatPrice(lowestPrice(event))}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  input: {
    flex: 1,
    height: '100%',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
  hint: {
    paddingHorizontal: 2,
  },
  list: {
    maxHeight: 420,
  },
  group: {
    overflow: 'hidden',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tikitiColors.separator,
  },
  pressed: {
    backgroundColor: tikitiColors.cardPressed,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  price: {
    color: tikitiColors.text,
  },
});
