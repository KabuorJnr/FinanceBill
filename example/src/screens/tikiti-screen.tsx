import { useCallback, type ComponentRef, type Ref } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type PressableProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView } from '../components/symbol-view';
import {
  ARTIST,
  ArtistAvatar,
  ConcertTray,
  HOTELS,
  HotelsTray,
  REGIONS,
  SHOWS,
  TIERS,
  formatKES,
  tikitiColors,
  tikitiType,
} from '../components/tikiti';

const HERO_SHARE = 0.56;
const CITIES = [...new Set(SHOWS.map((show) => show.venue.city.name))];
const FROM_PRICE = Math.min(...TIERS.map((tier) => tier.price));

interface IPressableRefProps extends Omit<PressableProps, 'style'> {
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export default function TikitiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View
          style={[styles.hero, { height: Math.round(height * HERO_SHARE) }]}
        >
          <LinearGradient
            colors={[
              tikitiColors.kenyaRed,
              '#5A0712',
              tikitiColors.kenyaGreen,
              tikitiColors.background,
            ]}
            locations={[0, 0.45, 0.8, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <ConcertTray>
              <UpcomingPill />
            </ConcertTray>
            <Text style={styles.name}>{ARTIST.name.toUpperCase()}</Text>
            <Text style={tikitiType.caption}>
              {ARTIST.genre} · {ARTIST.tour}
            </Text>
          </View>
        </View>

        <View style={styles.sections}>
          <View style={styles.release}>
            <ArtistAvatar size={56} />
            <View style={styles.grow}>
              <Text style={tikitiType.caption}>{ARTIST.latest.date}</Text>
              <Text style={tikitiType.headline}>
                {ARTIST.latest.title} – {ARTIST.latest.kind}
              </Text>
              <Text style={tikitiType.caption}>Latest release</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={tikitiType.title}>Top Songs</Text>
            {ARTIST.songs.map((song, index) => (
              <View key={song.title} style={styles.song}>
                <Text style={[tikitiType.caption, styles.songIndex]}>
                  {index + 1}
                </Text>
                <View style={styles.grow}>
                  <Text style={tikitiType.body}>{song.title}</Text>
                  <Text style={tikitiType.caption}>
                    {song.album} · {song.year}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={tikitiType.title}>On Tour</Text>
            <Text style={tikitiType.caption}>
              {SHOWS.length} shows across {CITIES.join(', ')}. Book tickets,
              find a hotel, get directions and order a boda, tuk-tuk or car to
              the venue, all from one tray.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={tikitiType.title}>Where to Stay</Text>
            <HotelsTray>
              <StayCard />
            </HotelsTray>
          </View>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        onPress={goBack}
        style={({ pressed }) => [
          styles.back,
          { top: insets.top + 8 },
          pressed && styles.pressed,
        ]}
      >
        <SymbolView
          name="chevron.left"
          size={15}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      </Pressable>

      <View
        pointerEvents="box-none"
        style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <ConcertTray>
          <TicketsBar />
        </ConcertTray>
      </View>
    </View>
  );
}

function UpcomingPill(props: IPressableRefProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      <SymbolView
        name="ticket.fill"
        size={12}
        weight="semibold"
        tintColor={tikitiColors.text}
      />
      <Text style={styles.pillText}>Upcoming Concerts</Text>
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
        <Text style={tikitiType.caption} numberOfLines={2}>
          {REGIONS.join(' · ')}
        </Text>
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

function TicketsBar(props: IPressableRefProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [styles.tickets, pressed && styles.pressed]}
    >
      <View style={styles.grow}>
        <Text style={tikitiType.headline}>Get Tickets</Text>
        <Text style={styles.ticketsCaption}>
          {SHOWS.length} shows · from {formatKES(FROM_PRICE)}
        </Text>
      </View>
      <SymbolView
        name="chevron.right"
        size={14}
        weight="bold"
        tintColor={tikitiColors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tikitiColors.background,
  },
  pressed: {
    opacity: 0.8,
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  hero: {
    justifyContent: 'flex-end',
  },
  heroContent: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: tikitiColors.text,
  },
  name: {
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 6,
    color: tikitiColors.text,
  },
  back: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sections: {
    gap: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  release: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  section: {
    gap: 10,
  },
  song: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  songIndex: {
    width: 16,
    textAlign: 'center',
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
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tickets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 64,
    paddingHorizontal: 22,
    borderRadius: 32,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.accent,
  },
  ticketsCaption: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
