import { useCallback, useState, type ComponentRef, type Ref } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  NYOTA_TOUR,
  OrganizerTray,
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

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 110 },
        ]}
      >
        <View style={styles.header}>
          <RoundButton icon="chevron.left" label="Back" onPress={goBack} />
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
          <LinearGradient
            colors={[tikitiColors.kenyaRed, '#5A0712', tikitiColors.kenyaGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.featuredEyebrow}>FEATURED TOUR</Text>
          <Text style={styles.featuredTitle}>{NYOTA_TOUR.artist}</Text>
          <Text style={styles.featuredCaption}>
            {NYOTA_TOUR.title} · {tourStops.length} shows
          </Text>
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

        <Text style={[tikitiType.title, styles.sectionTitle]}>
          Where to Stay
        </Text>
        <HotelsTray>
          <StayCard />
        </HotelsTray>

        <Text style={[tikitiType.caption, styles.footnote]}>
          {backend === 'firebase'
            ? 'Organisers’ events are live from Firebase.'
            : 'Firebase isn’t configured, so posted events stay on this phone.'}
        </Text>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <OrganizerTray>
          <PostBar signedIn={!!organizer} />
        </OrganizerTray>
      </View>
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
        size={15}
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
            <Text style={[tikitiType.caption, selected && styles.chipText]}>
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
      accessibilityLabel={`${event.title}, ${weekday} ${day} ${monthShort}`}
      {...rest}
      style={({ pressed }) => [styles.event, pressed && styles.pressed]}
    >
      <View style={[styles.date, { backgroundColor: category.color }]}>
        <Text style={styles.dateMonth}>{monthShort.toUpperCase()}</Text>
        <Text style={styles.dateDay}>{day}</Text>
      </View>
      <View style={styles.grow}>
        <Text style={tikitiType.headline} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={tikitiType.caption} numberOfLines={1}>
          {weekday} {formatTime(event.time)} · {event.venue.name},{' '}
          {event.venue.city.name}
        </Text>
        <Text style={tikitiType.caption} numberOfLines={1}>
          {category.label} · by {event.organizer.name}
        </Text>
      </View>
      <Text style={[tikitiType.caption, styles.price]}>
        {formatPrice(lowestPrice(event))}
      </Text>
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
          size={20}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      </View>
      <View style={styles.grow}>
        <Text style={tikitiType.headline}>
          {HOTELS.length} hotels, resorts and lodges
        </Text>
        <Text style={tikitiType.caption}>Nightly rates by room type</Text>
      </View>
      <SymbolView
        name="chevron.right"
        size={13}
        weight="semibold"
        tintColor={tikitiColors.textTertiary}
      />
    </Pressable>
  );
}

function PostBar({
  signedIn,
  ...rest
}: IPressableRefProps & { signedIn: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [styles.post, pressed && styles.pressed]}
    >
      <SymbolView
        name="plus"
        size={16}
        weight="bold"
        tintColor={tikitiColors.text}
      />
      <View style={styles.grow}>
        <Text style={tikitiType.headline}>
          {signedIn ? 'Post or Manage Events' : 'Organising an Event?'}
        </Text>
        <Text style={styles.postCaption}>
          {signedIn
            ? 'Publish and sell tickets with M-Pesa'
            : 'Create an organiser account and post it'}
        </Text>
      </View>
    </Pressable>
  );
}

const GUTTER = 20;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tikitiColors.background,
  },
  content: {
    gap: 14,
    paddingHorizontal: GUTTER,
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    fontSize: 30,
    fontWeight: '800',
    color: tikitiColors.text,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.card,
  },
  error: {
    color: tikitiColors.accent,
  },
  featured: {
    overflow: 'hidden',
    gap: 2,
    padding: 18,
    borderRadius: 22,
    borderCurve: 'continuous',
  },
  featuredEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  featuredTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    color: tikitiColors.text,
  },
  featuredCaption: {
    fontSize: 13,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: tikitiColors.card,
  },
  chipSelected: {
    backgroundColor: tikitiColors.accent,
  },
  chipText: {
    color: tikitiColors.text,
  },
  list: {
    gap: 10,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
  },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  date: {
    width: 46,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '800',
    color: tikitiColors.text,
  },
  price: {
    color: tikitiColors.text,
  },
  sectionTitle: {
    marginTop: 10,
  },
  stay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  stayIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
  },
  footnote: {
    textAlign: 'center',
    marginTop: 6,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
  },
  post: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 64,
    paddingHorizontal: 22,
    borderRadius: 32,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.accent,
  },
  postCaption: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
