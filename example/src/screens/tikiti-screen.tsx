import { useState, type ComponentRef, type Ref } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView, type SFSymbol } from '../components/symbol-view';
import {
  CATEGORIES,
  CITIES,
  EventTray,
  HOTELS,
  HotelsTray,
  KenyaBand,
  NYOTA_TOUR,
  OrganizerTray,
  TAB_BAR_CLEARANCE,
  TabBar,
  categoryOf,
  dateParts,
  formatPrice,
  formatTime,
  lowestPrice,
  tikitiColors,
  tikitiType,
  useEvents,
  type IEvent,
  type TCategory,
} from '../components/tikiti';
import { sfFont } from '../utils';

interface IPressableRefProps extends Omit<PressableProps, 'style'> {
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export default function TikitiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events, organizer, backend, error } = useEvents();
  const [cityId, setCityId] = useState<string | null>(null);
  const [category, setCategory] = useState<TCategory | null>(null);

  const listed = events.filter(
    (event) =>
      (!cityId || event.venue.city.id === cityId) &&
      (!category || event.category === category)
  );
  const tourStops = events.filter((event) => event.tourId === NYOTA_TOUR.id);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + TAB_BAR_CLEARANCE + 16,
          },
        ]}
      >
        <View style={styles.header}>
          <RoundButton
            icon="square.grid.2x2.fill"
            label="Morphlet demos"
            onPress={() => router.push('/demos')}
          />
          <View style={styles.grow}>
            <Text style={styles.brand}>Tikiti</Text>
            <Text style={tikitiType.caption}>
              {events.length} upcoming events across Kenya
            </Text>
          </View>
          <OrganizerTray>
            <RoundButton
              icon={organizer ? 'person.fill' : 'person.badge.plus'}
              label="For organisers"
            />
          </OrganizerTray>
        </View>

        {error && (
          <Text style={[tikitiType.caption, styles.error]}>
            Couldn’t load organisers’ events: {error}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/artist')}
          style={({ pressed }) => [styles.featured, pressed && styles.pressed]}
        >
          <View style={styles.featuredBody}>
            <View style={styles.featuredBadgeRow}>
              <Text style={styles.featuredEyebrow}>FEATURED TOUR</Text>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>TRENDING</Text>
              </View>
            </View>
            <Text style={styles.featuredTitle}>{NYOTA_TOUR.artist}</Text>
            <Text style={styles.featuredCaption}>
              {NYOTA_TOUR.title} · {tourStops.length} shows across Kenya
            </Text>
          </View>
          <KenyaBand />
        </Pressable>

        <Filters
          options={CITIES.map((city) => ({ value: city.id, label: city.name }))}
          value={cityId}
          allLabel="All Kenya"
          onChange={setCityId}
        />
        <Filters
          options={CATEGORIES}
          value={category}
          allLabel="Everything"
          onChange={setCategory}
        />

        <View style={styles.list}>
          {listed.length === 0 ? (
            <Text style={[tikitiType.caption, styles.empty]}>
              Hakuna matukio. No events match these filters yet.
            </Text>
          ) : (
            listed.map((event) => (
              <EventTray key={event.id} events={[event]}>
                <EventRow event={event} />
              </EventTray>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Where to Stay
        </Text>
        <HotelsTray>
          <StayCard />
        </HotelsTray>

        <Text style={styles.footnote}>
          {backend === 'firebase'
            ? 'Organisers’ events are live from Firebase.'
            : 'Firebase isn’t configured, so posted events stay on this phone.'}
        </Text>
      </ScrollView>

      <TabBar active="home" />
    </View>
  );
}

function RoundButton({
  icon,
  label,
  ...rest
}: IPressableRefProps & { icon: SFSymbol; label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      {...rest}
      style={({ pressed }) => [styles.round, pressed && styles.pressed]}
    >
      <SymbolView
        name={icon}
        size={16}
        weight="semibold"
        tintColor={tikitiColors.text}
      />
    </Pressable>
  );
}

function Filters<TValue extends string>({
  options,
  value,
  allLabel,
  onChange,
}: {
  options: { value: TValue; label: string }[];
  value: TValue | null;
  allLabel: string;
  onChange: (value: TValue | null) => void;
}) {
  const all = [{ value: null, label: allLabel }, ...options];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bleed}
      contentContainerStyle={styles.chips}
    >
      {all.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function EventRow({ event, ...rest }: IPressableRefProps & { event: IEvent }) {
  const { weekday, day, monthShort } = dateParts(event.date);
  const category = categoryOf(event.category);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={'item-' + event.id}
      {...rest}
      style={({ pressed }) => [styles.event, pressed && styles.pressed]}
    >
      <View style={[styles.date, { backgroundColor: category.color }]}>
        <Text style={styles.dateMonth}>{monthShort.toUpperCase()}</Text>
        <Text style={styles.dateDay}>{day}</Text>
      </View>
      <View style={styles.grow}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.eventMeta} numberOfLines={1}>
          {weekday} {formatTime(event.time)} · {event.venue.name},{' '}
          {event.venue.city.name}
        </Text>
        <Text style={styles.eventOrganizer} numberOfLines={1}>
          {category.label} · by {event.organizer.name}
        </Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          {formatPrice(lowestPrice(event))}
        </Text>
        <View style={styles.mpesaBadge}>
          <Text style={styles.mpesaText}>M-PESA</Text>
        </View>
      </View>
    </Pressable>
  );
}

function StayCard(props: IPressableRefProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [styles.stay, pressed && styles.pressed]}
    >
      <View style={styles.stayIcon}>
        <SymbolView
          name="bed.double.fill"
          size={22}
          weight="semibold"
          tintColor="#FFFFFF"
        />
      </View>
      <View style={styles.grow}>
        <Text style={styles.stayTitle}>
          {HOTELS.length} hotels, resorts and lodges
        </Text>
        <Text style={styles.stayCaption}>Nightly rates by room type</Text>
      </View>
      <SymbolView
        name="chevron.right"
        size={14}
        weight="semibold"
        tintColor="rgba(255, 255, 255, 0.4)"
      />
    </Pressable>
  );
}

const GUTTER = 18;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tikitiColors.background,
  },
  content: {
    gap: 16,
    paddingHorizontal: GUTTER,
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    fontSize: 32,
    ...sfFont('700'),
    letterSpacing: -0.6,
    color: tikitiColors.text,
  },
  round: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  error: {
    ...sfFont('500'),
    color: tikitiColors.accentBright,
  },
  featured: {
    overflow: 'hidden',
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: '#8B0000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#BB0000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  featuredBody: {
    gap: 6,
    padding: 20,
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveText: {
    fontSize: 9,
    ...sfFont('700'),
    letterSpacing: 0.8,
    color: '#34D399',
  },
  featuredEyebrow: {
    fontSize: 11,
    ...sfFont('700'),
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  featuredTitle: {
    fontSize: 32,
    ...sfFont('700'),
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  featuredCaption: {
    fontSize: 13,
    ...sfFont('500'),
    color: 'rgba(255, 255, 255, 0.85)',
  },
  bleed: {
    marginHorizontal: -GUTTER,
    flexGrow: 0,
  },
  chips: {
    gap: 8,
    paddingHorizontal: GUTTER,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipSelected: {
    backgroundColor: tikitiColors.accent,
    borderColor: tikitiColors.accentBright,
  },
  chipText: {
    fontSize: 13,
    ...sfFont('600'),
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  list: {
    gap: 12,
  },
  empty: {
    paddingVertical: 32,
    textAlign: 'center',
    ...sfFont('500'),
    color: tikitiColors.textSecondary,
  },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  date: {
    width: 48,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  dateMonth: {
    fontSize: 10,
    ...sfFont('700'),
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dateDay: {
    fontSize: 19,
    ...sfFont('700'),
    color: '#FFFFFF',
  },
  eventTitle: {
    fontSize: 16,
    ...sfFont('600'),
    color: '#FFFFFF',
  },
  eventMeta: {
    fontSize: 13,
    ...sfFont(),
    color: 'rgba(255, 255, 255, 0.58)',
  },
  eventOrganizer: {
    fontSize: 12,
    ...sfFont('500'),
    color: 'rgba(255, 255, 255, 0.42)',
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 5,
  },
  price: {
    fontSize: 14,
    ...sfFont('700'),
    color: '#FFFFFF',
  },
  mpesaBadge: {
    backgroundColor: 'rgba(47, 168, 79, 0.16)',
    borderColor: 'rgba(47, 168, 79, 0.45)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mpesaText: {
    fontSize: 9,
    ...sfFont('700'),
    letterSpacing: 0.6,
    color: '#34D399',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 2,
    fontSize: 20,
    ...sfFont('700'),
    color: '#FFFFFF',
  },
  stay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  stayIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
  },
  stayTitle: {
    fontSize: 16,
    ...sfFont('600'),
    color: '#FFFFFF',
  },
  stayCaption: {
    fontSize: 13,
    ...sfFont(),
    color: 'rgba(255, 255, 255, 0.58)',
  },
  footnote: {
    textAlign: 'center',
    marginTop: 8,
    ...sfFont(),
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.35)',
  },
});
