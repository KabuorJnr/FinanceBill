import {
  useState,
  type ComponentRef,
  type ReactElement,
  type Ref,
} from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type PressableProps,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tray } from 'morphlet';

import { SymbolView, type SFSymbol } from '../components/symbol-view';
import {
  Artwork,
  EventTray,
  KenyaBand,
  MiniPlayer,
  NYOTA_TOUR,
  TAB_BAR_CLEARANCE,
  TabBar,
  TikitiHeader,
  TIKITI_TRAY_CONTENT,
  formatPrice,
  lowestPrice,
  tikitiColors,
  tikitiType,
  useEvents,
} from '../components/tikiti';

const HERO_SHARE = 0.42;
const COLLAPSED_SONGS = 3;

interface IPressableRefProps extends Omit<PressableProps, 'style'> {
  ref?: Ref<ComponentRef<typeof Pressable>>;
}

export default function ArtistScreen() {
  const { events } = useEvents();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const shows = events.filter((event) => event.tourId === NYOTA_TOUR.id);
  const [songIndex, setSongIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allSongs, setAllSongs] = useState(false);

  const songs = NYOTA_TOUR.songs;
  const song = songs[songIndex % songs.length]!;
  const heroHeight = Math.round(height * HERO_SHARE);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const shareTour = () =>
    Share.share({
      message: `${NYOTA_TOUR.artist}: ${NYOTA_TOUR.title}. ${shows.length} shows across Kenya, tickets on Tikiti.`,
    }).catch(() => undefined);

  const play = (index: number) => {
    setSongIndex(index);
    setPlaying(true);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE + 72,
        }}
      >
        <Artwork
          seed="nyota-hero"
          hero
          width={width}
          height={heroHeight}
          radius={0}
        />
        <KenyaBand height={14} />

        <View style={styles.headline}>
          <EventTray events={shows} listTitle="">
            <UpcomingPill />
          </EventTray>
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
            {NYOTA_TOUR.artist.toUpperCase()}
          </Text>
          <View style={styles.actions}>
            <InfoTray showCount={shows.length}>
              <RoundIcon icon="info" label="About" />
            </InfoTray>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={playing ? 'Pause' : 'Play'}
              onPress={() => setPlaying((current) => !current)}
              style={({ pressed }) => [styles.play, pressed && styles.pressed]}
            >
              <SymbolView
                name={playing ? 'pause.fill' : 'play.fill'}
                size={22}
                weight="bold"
                tintColor="#000000"
              />
            </Pressable>
            <RoundIcon
              icon={following ? 'star.fill' : 'star'}
              label={following ? 'Unfollow' : 'Follow'}
              tint={following ? tikitiColors.accentBright : undefined}
              onPress={() => setFollowing((current) => !current)}
            />
          </View>
        </View>

        <View style={styles.sections}>
          <View style={styles.release}>
            <Artwork seed={NYOTA_TOUR.latest.title} size={60} radius={8} />
            <View style={styles.grow}>
              <Text style={tikitiType.caption}>{NYOTA_TOUR.latest.date}</Text>
              <Text style={tikitiType.headline} numberOfLines={1}>
                {NYOTA_TOUR.latest.title} – {NYOTA_TOUR.latest.kind}
              </Text>
              <Text style={tikitiType.caption}>1 song</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Saved' : 'Save'}
              hitSlop={10}
              onPress={() => setSaved((current) => !current)}
            >
              <SymbolView
                name={saved ? 'checkmark' : 'arrow.down'}
                size={16}
                weight="semibold"
                tintColor={
                  saved ? tikitiColors.accentBright : tikitiColors.text
                }
              />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAllSongs((current) => !current)}
              style={styles.sectionHeader}
            >
              <Text style={tikitiType.title}>Top Songs</Text>
              <SymbolView
                name={allSongs ? 'chevron.down' : 'chevron.right'}
                size={13}
                weight="bold"
                tintColor={tikitiColors.textSecondary}
              />
            </Pressable>
            {(allSongs ? songs : songs.slice(0, COLLAPSED_SONGS)).map(
              (item, index) => (
                <Pressable
                  key={item.title}
                  accessibilityRole="button"
                  onPress={() => play(index)}
                  style={({ pressed }) => [
                    styles.song,
                    pressed && styles.pressed,
                  ]}
                >
                  <Artwork seed={item.title} size={46} radius={6} />
                  <View style={[styles.grow, styles.songText]}>
                    <Text
                      style={[
                        tikitiType.body,
                        playing && songIndex === index && styles.songPlaying,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={tikitiType.caption} numberOfLines={1}>
                      {item.album} · {item.year}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Share ${item.title}`}
                    hitSlop={10}
                    onPress={() =>
                      Share.share({
                        message: `${item.title} by ${NYOTA_TOUR.artist}`,
                      }).catch(() => undefined)
                    }
                  >
                    <SymbolView
                      name="ellipsis"
                      size={15}
                      weight="semibold"
                      tintColor={tikitiColors.textSecondary}
                    />
                  </Pressable>
                </Pressable>
              )
            )}
          </View>

          <View style={styles.section}>
            <Text style={tikitiType.title}>On Tour</Text>
            <EventTray events={shows} listTitle="">
              <TourCard
                caption={`${shows.length} shows · from ${formatPrice(
                  shows.length ? Math.min(...shows.map(lowestPrice)) : 0
                )}`}
              />
            </EventTray>
          </View>
        </View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[styles.topBar, { top: insets.top + 6 }]}
      >
        <RoundIcon icon="chevron.left" label="Back" onPress={goBack} glass />
        <View style={styles.capsule}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share"
            hitSlop={6}
            onPress={shareTour}
            style={styles.capsuleButton}
          >
            <SymbolView
              name="square.and.arrow.up"
              size={15}
              weight="semibold"
              tintColor={tikitiColors.text}
            />
          </Pressable>
          <InfoTray showCount={shows.length}>
            <CapsuleButton icon="ellipsis" label="More" />
          </InfoTray>
        </View>
      </View>

      <TabBar
        active="artists"
        accessory={
          <MiniPlayer
            title={song.title}
            artist={NYOTA_TOUR.artist}
            playing={playing}
            onToggle={() => setPlaying((current) => !current)}
            onNext={() => play((songIndex + 1) % songs.length)}
          />
        }
      />
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

function RoundIcon({
  icon,
  label,
  tint,
  glass,
  ...rest
}: IPressableRefProps & {
  icon: SFSymbol;
  label: string;
  tint?: string;
  glass?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      {...rest}
      style={({ pressed }) => [
        styles.round,
        glass && styles.roundGlass,
        pressed && styles.pressed,
      ]}
    >
      <SymbolView
        name={icon}
        size={14}
        weight="bold"
        tintColor={tint ?? tikitiColors.text}
      />
    </Pressable>
  );
}

function CapsuleButton({
  icon,
  label,
  ...rest
}: IPressableRefProps & { icon: SFSymbol; label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      {...rest}
      style={styles.capsuleButton}
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

function TourCard({
  caption,
  ...rest
}: IPressableRefProps & { caption: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [styles.tour, pressed && styles.pressed]}
    >
      <View style={styles.tourIcon}>
        <SymbolView
          name="ticket.fill"
          size={18}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      </View>
      <View style={styles.grow}>
        <Text style={tikitiType.headline}>{NYOTA_TOUR.title}</Text>
        <Text style={tikitiType.caption}>{caption}</Text>
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

function InfoTray({
  showCount,
  children,
}: {
  showCount: number;
  children: ReactElement;
}) {
  return (
    <Tray.Root>
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>
      <Tray.Content {...TIKITI_TRAY_CONTENT}>
        <TikitiHeader views={{}} />
        <Tray.Body>
          <View style={styles.info}>
            <Artwork seed="nyota-hero" size={84} radius={42} />
            <Tray.Title style={styles.infoName}>
              {NYOTA_TOUR.artist.toUpperCase()}
            </Tray.Title>
            <Text style={tikitiType.caption}>{NYOTA_TOUR.genre}</Text>
            <Tray.Description style={[tikitiType.body, styles.infoBio]}>
              {NYOTA_TOUR.bio}
            </Tray.Description>
            <Text style={tikitiType.caption}>
              {NYOTA_TOUR.title} · {showCount} shows
            </Text>
          </View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tikitiColors.page,
  },
  pressed: {
    opacity: 0.75,
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  headline: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: tikitiColors.pageButton,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: tikitiColors.text,
  },
  name: {
    fontFamily: 'AbrilFatface_400Regular',
    fontSize: 52,
    letterSpacing: 2,
    color: tikitiColors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
    marginTop: 2,
  },
  play: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
    backgroundColor: '#FFFFFF',
  },
  round: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.pageButton,
  },
  roundGlass: {
    backgroundColor: tikitiColors.glass,
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 4,
    borderRadius: 18,
    backgroundColor: tikitiColors.glass,
  },
  capsuleButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sections: {
    gap: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  release: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    paddingRight: 16,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.pageCard,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  song: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  songText: {
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tikitiColors.separator,
  },
  songPlaying: {
    color: tikitiColors.accentBright,
  },
  tour: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.pageCard,
  },
  tourIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.accent,
  },
  info: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  infoName: {
    fontFamily: 'AbrilFatface_400Regular',
    fontSize: 32,
    letterSpacing: 1,
    color: tikitiColors.text,
  },
  infoBio: {
    textAlign: 'center',
    color: tikitiColors.textSecondary,
    lineHeight: 22,
  },
});
