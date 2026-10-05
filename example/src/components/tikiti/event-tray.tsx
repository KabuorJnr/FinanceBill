import { useState, type ReactElement } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Tray, useTray } from 'morphlet';

import { AnimatedTabs } from '../artist/animated-tabs';
import { SymbolView } from '../symbol-view';
import { CheckoutTray } from './checkout-tray';
import {
  HotelView,
  NEW_STAY,
  NearbyHotelsView,
  StayView,
  type IStay,
} from './hotel-views';
import { hotelsNear, type IHotel } from './hotels.data';
import {
  categoryOf,
  displayName,
  type IEvent,
  type ITier,
} from './events.data';
import {
  DRIVERS,
  MAX_TICKETS,
  RIDES,
  TRAVEL_MODES,
  dateParts,
  distanceKm,
  fareFor,
  formatKES,
  formatKm,
  formatLongDate,
  formatPrice,
  formatTime,
  groupByMonth,
  todayInKenya,
  travelMinutes,
  type IRide,
  type IVenue,
  type TRideId,
  type TTravelMode,
} from './tikiti.data';
import {
  DateBlock,
  DateTile,
  Group,
  ListRow,
  NumberPlate,
  Radio,
  Stepper,
  TikitiButton,
  ArtistAvatar,
  TikitiHeader,
  VenueMap,
  tikitiType,
} from './tikiti-parts';
import { TIKITI_TRAY_CONTENT, tikitiColors } from './tikiti.theme';

const MAPS_MODES: Record<
  Exclude<TTravelMode, 'ride'>,
  { apple: string; google: string }
> = {
  drive: { apple: 'd', google: 'driving' },
  walk: { apple: 'w', google: 'walking' },
  matatu: { apple: 'r', google: 'transit' },
};

function startInMaps(venue: IVenue, mode: Exclude<TTravelMode, 'ride'>) {
  const { latitude, longitude } = venue.coordinate;
  const google = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${MAPS_MODES[mode].google}`;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=${MAPS_MODES[mode].apple}`
      : google;
  Linking.openURL(url).catch(() => Linking.openURL(google));
}

interface IDraft {
  event: IEvent;
  tierId: string;
  quantity: number;
  mode: TTravelMode;
  rideId: TRideId;
  hotel: IHotel | null;
  stay: IStay;
}

function newDraft(event: IEvent): IDraft {
  return {
    event,
    tierId: event.tiers[0]!.id,
    quantity: 2,
    mode: 'ride',
    rideId: 'boda',
    hotel: null,
    stay: NEW_STAY,
  };
}

interface IEventTrayProps {
  /** One event opens straight to it; several open a list first. */
  events: IEvent[];
  listTitle?: string;
  /** Stack over another tray, e.g. from search results. */
  stack?: boolean;
  children: ReactElement;
}

export function EventTray({
  events,
  listTitle = 'Upcoming Events',
  stack = false,
  children,
}: IEventTrayProps) {
  const [draft, setDraft] = useState<IDraft>(() => newDraft(events[0]!));
  const update = (patch: Partial<IDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const show = draft.event;
  const tier =
    show.tiers.find((option) => option.id === draft.tierId) ?? show.tiers[0]!;
  const ride = RIDES.find((option) => option.id === draft.rideId)!;
  const isList = events.length > 1;

  if (events.length === 0) return children;

  return (
    <Tray.Root
      defaultView={isList ? 'shows' : 'concert'}
      onOpenChange={(open) => open && setDraft(newDraft(events[0]!))}
    >
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>

      <Tray.Content stack={stack} {...TIKITI_TRAY_CONTENT}>
        <TikitiHeader
          views={{
            shows: { title: listTitle },
            concert: { title: categoryOf(show.category).label },
            directions: { title: 'Directions' },
            rides: { title: 'Choose a Ride' },
            ride: { title: 'Ride Booked', back: false },
            tickets: { title: 'Tickets' },
            hotels: { title: 'Where to Stay' },
            hotel: { title: draft.hotel?.name ?? 'Hotel' },
            stay: { title: '', back: false },
          }}
        />
        <Tray.Body>
          <Tray.View name="shows">
            <ShowsView
              events={events}
              onSelect={(next) =>
                update({ event: next, tierId: next.tiers[0]!.id })
              }
            />
          </Tray.View>
          <Tray.View name="concert">
            <ConcertView show={show} />
          </Tray.View>
          <Tray.View name="hotels">
            <NearbyHotelsView
              venue={show.venue}
              onSelect={(hotel) => update({ hotel, stay: NEW_STAY })}
            />
          </Tray.View>
          <Tray.View name="hotel">
            {draft.hotel && (
              <HotelView
                hotel={draft.hotel}
                venue={show.venue}
                checkIn={show.date}
                stay={draft.stay}
                onStayChange={(stay) => update({ stay })}
              />
            )}
          </Tray.View>
          <Tray.View name="stay">
            {draft.hotel && (
              <StayView
                hotel={draft.hotel}
                stay={draft.stay}
                checkIn={show.date}
              />
            )}
          </Tray.View>
          <Tray.View name="directions">
            <DirectionsView
              venue={show.venue}
              mode={draft.mode}
              onModeChange={(mode) => update({ mode })}
            />
          </Tray.View>
          <Tray.View name="rides">
            <RidesView
              venue={show.venue}
              ride={ride}
              onRideChange={(rideId) => update({ rideId })}
            />
          </Tray.View>
          <Tray.View name="ride">
            <RideView venue={show.venue} ride={ride} />
          </Tray.View>
          <Tray.View name="tickets">
            <TicketsView
              show={show}
              tier={tier}
              quantity={draft.quantity}
              onTierChange={(tierId) => update({ tierId })}
              onQuantityChange={(quantity) => update({ quantity })}
            />
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

function ShowsView({
  events,
  onSelect,
}: {
  events: IEvent[];
  onSelect: (event: IEvent) => void;
}) {
  const { setView } = useTray();
  // A tour lists venues; a mixed list names each event.
  const isTour = events.every((event) => event.tourId === events[0]!.tourId);
  const thisYear = todayInKenya().slice(0, 4);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      {groupByMonth(events).map((group) => (
        <View key={group.month} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={tikitiType.title}>
              {group.month.replace(` ${thisYear}`, '')}
            </Text>
            <Text style={tikitiType.caption}>
              {group.items.length}{' '}
              {isTour
                ? group.items.length === 1
                  ? 'show'
                  : 'shows'
                : group.items.length === 1
                  ? 'event'
                  : 'events'}
            </Text>
          </View>
          <Group>
            {group.items.map((item, index) => (
              <ListRow
                key={item.id}
                divider={index > 0}
                leading={<DateBlock date={item.date} />}
                title={isTour && item.tourId ? item.venue.name : item.title}
                subtitle={
                  isTour && item.tourId
                    ? `${item.venue.area}, Kenya · ${formatTime(item.time)}`
                    : `${item.venue.name}, ${item.venue.city.name} · ${formatTime(item.time)}`
                }
                chevron
                onPress={() => {
                  onSelect(item);
                  setView('concert');
                }}
              />
            ))}
          </Group>
        </View>
      ))}
    </ScrollView>
  );
}

function Fact({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <View style={[styles.fact, divider && styles.divider]}>
      <Text style={tikitiType.caption}>{label}</Text>
      <Text style={[tikitiType.body, styles.factValue]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ConcertView({ show }: { show: IEvent }) {
  const { setView } = useTray();
  const { venue } = show;
  const nearbyCount = hotelsNear(venue.coordinate).length;

  return (
    <View style={styles.page}>
      <VenueMap venue={venue} height={160} />
      <View style={styles.venue}>
        <DateTile date={show.date} />
        <View style={styles.grow}>
          <Text style={tikitiType.headline} numberOfLines={1}>
            {venue.name}
          </Text>
          <Text style={tikitiType.caption} numberOfLines={1}>
            {venue.area}, {venue.city.name}, Kenya
          </Text>
        </View>
      </View>
      <Group>
        <Fact label="Date" value={formatLongDate(show.date)} />
        <Fact label="Time" value={formatTime(show.time)} divider />
        <Fact
          label="Address"
          value={`${venue.area}, ${venue.city.name}`}
          divider
        />
        {!show.tourId && (
          <Fact label="Organiser" value={show.organizer.name} divider />
        )}
      </Group>
      {!show.tourId && !!show.description && (
        <Text style={tikitiType.caption} numberOfLines={3}>
          {show.description}
        </Text>
      )}
      <Group>
        <ListRow
          leading={
            <SymbolView
              name="bed.double.fill"
              size={18}
              weight="semibold"
              tintColor={tikitiColors.textSecondary}
            />
          }
          title="Where to Stay"
          subtitle={`${nearbyCount} hotels near ${venue.area}`}
          chevron
          onPress={() => setView('hotels')}
        />
      </Group>
      <View style={styles.buttons}>
        <TikitiButton
          label="Directions"
          icon="map.fill"
          variant="secondary"
          onPress={() => setView('directions')}
        />
        <TikitiButton
          label="Tickets"
          icon="ticket.fill"
          onPress={() => setView('tickets')}
        />
      </View>
    </View>
  );
}

interface IDirectionsViewProps {
  venue: IVenue;
  mode: TTravelMode;
  onModeChange: (mode: TTravelMode) => void;
}

function DirectionsView({ venue, mode, onModeChange }: IDirectionsViewProps) {
  const { setView } = useTray();
  const km = distanceKm(venue.city.origin.coordinate, venue.coordinate);
  const minutes = travelMinutes(mode, km);
  const label = TRAVEL_MODES.find((option) => option.value === mode)!.label;

  return (
    <View style={styles.page}>
      <VenueMap venue={venue} showRoute />
      <Group>
        <ListRow
          muted
          leading={
            <RouteIcon
              icon="location.fill"
              color={tikitiColors.textSecondary}
            />
          }
          title="Current Location"
        />
        <ListRow
          divider
          leading={
            <RouteIcon
              icon="mappin.and.ellipse"
              color={tikitiColors.accentBright}
            />
          }
          title={venue.name}
        />
      </Group>

      <AnimatedTabs tabs={TRAVEL_MODES} value={mode} onChange={onModeChange} />

      <Tray.Morph value={mode} transition="slide">
        <Text style={[tikitiType.body, styles.tip]}>
          {formatKm(km)}, about {minutes} min
          {mode === 'ride' ? ' by car' : ` by ${label.toLowerCase()}`}.{' '}
          {venue.tip}
        </Text>
      </Tray.Morph>

      <TikitiButton
        label={mode === 'ride' ? 'Choose a Ride' : 'Start in Maps'}
        icon={
          mode === 'ride'
            ? 'car.fill'
            : 'arrow.triangle.turn.up.right.diamond.fill'
        }
        onPress={() =>
          mode === 'ride' ? setView('rides') : startInMaps(venue, mode)
        }
      />
    </View>
  );
}

function RouteIcon({
  icon,
  color,
}: {
  icon: 'location.fill' | 'mappin.and.ellipse';
  color: string;
}) {
  return (
    <View style={styles.routeIcon}>
      <SymbolView name={icon} size={15} weight="semibold" tintColor={color} />
    </View>
  );
}

interface IRidesViewProps {
  venue: IVenue;
  ride: IRide;
  onRideChange: (ride: TRideId) => void;
}

function RidesView({ venue, ride, onRideChange }: IRidesViewProps) {
  const { setView } = useTray();
  const km = distanceKm(venue.city.origin.coordinate, venue.coordinate);

  return (
    <View style={styles.page}>
      <Text style={tikitiType.caption}>
        {venue.city.origin.name} → {venue.name} · {formatKm(km)}
      </Text>
      <Group>
        {RIDES.map((option, index) => (
          <ListRow
            key={option.id}
            divider={index > 0}
            selected={option.id === ride.id}
            leading={
              <View style={styles.rideIcon}>
                <SymbolView
                  name={option.icon}
                  size={18}
                  weight="semibold"
                  tintColor={tikitiColors.text}
                />
              </View>
            }
            title={option.name}
            subtitle={`${option.pickupMinutes} min away · ${option.description}`}
            trailing={
              <Text style={tikitiType.headline}>
                {formatKES(fareFor(option, km))}
              </Text>
            }
            onPress={() => onRideChange(option.id)}
          />
        ))}
      </Group>
      <Text style={tikitiType.caption}>
        Pay your driver with M-Pesa or cash at the end of the trip.
      </Text>
      <TikitiButton
        label={`Request ${ride.name} · ${formatKES(fareFor(ride, km))}`}
        icon={ride.icon}
        onPress={() => setView('ride')}
      />
    </View>
  );
}

function RideView({ venue, ride }: { venue: IVenue; ride: IRide }) {
  const { setView } = useTray();
  const driver = DRIVERS[ride.id];
  const km = distanceKm(venue.city.origin.coordinate, venue.coordinate);
  const initials = driver.name
    .split(' ')
    .map((part) => part[0])
    .join('');

  return (
    <View style={styles.page}>
      <View style={styles.driver}>
        <View style={styles.avatar}>
          <Text style={tikitiType.headline}>{initials}</Text>
        </View>
        <View style={styles.grow}>
          <Text style={tikitiType.headline}>{driver.name}</Text>
          <Text style={tikitiType.caption} numberOfLines={1}>
            ★ {driver.rating.toFixed(1)} · {driver.vehicle}
          </Text>
        </View>
        <NumberPlate plate={driver.plate} />
      </View>
      <Group>
        <Fact label="Pickup in" value={`${ride.pickupMinutes} min`} />
        <Fact label="Drop-off" value={venue.name} divider />
        <Fact
          label="Trip"
          value={`${formatKm(km)} · ~${travelMinutes('ride', km)} min`}
          divider
        />
        <Fact label="Fare" value={formatKES(fareFor(ride, km))} divider />
      </Group>
      <View style={styles.buttons}>
        <TikitiButton
          label="Get Tickets"
          icon="ticket.fill"
          variant="secondary"
          onPress={() => setView('tickets')}
        />
        <Tray.Close asChild>
          <TikitiButton label="Done" />
        </Tray.Close>
      </View>
    </View>
  );
}

interface ITicketsViewProps {
  show: IEvent;
  tier: ITier;
  quantity: number;
  onTierChange: (tierId: string) => void;
  onQuantityChange: (quantity: number) => void;
}

function TicketsView({
  show,
  tier,
  quantity,
  onTierChange,
  onQuantityChange,
}: ITicketsViewProps) {
  const { close } = useTray();
  const [policyOpen, setPolicyOpen] = useState(false);
  const { monthShort, day } = dateParts(show.date);
  const total = tier.price * quantity;

  return (
    <View style={styles.page}>
      <View style={styles.artist}>
        <ArtistAvatar size={52} event={show} />
        <View style={styles.grow}>
          <Text style={tikitiType.eyebrow}>
            {monthShort.toUpperCase()} {day} · {formatTime(show.time)}
          </Text>
          <Text style={tikitiType.title} numberOfLines={1}>
            {displayName(show)}
          </Text>
          <Text style={tikitiType.caption} numberOfLines={1}>
            {show.venue.name} · {show.venue.city.name}
          </Text>
        </View>
      </View>

      <Text style={tikitiType.section}>Ticket Type</Text>
      <Group>
        {show.tiers.map((option, index) => (
          <ListRow
            key={option.id}
            divider={index > 0}
            selected={option.id === tier.id}
            leading={<Radio selected={option.id === tier.id} />}
            title={option.name}
            subtitle={option.detail}
            trailing={
              <Text
                style={
                  option.id === tier.id
                    ? tikitiType.headline
                    : [tikitiType.body, styles.priceIdle]
                }
              >
                {formatPrice(option.price)}
              </Text>
            }
            onPress={() => onTierChange(option.id)}
          />
        ))}
      </Group>

      <View style={styles.quantity}>
        <View style={styles.grow}>
          <Text style={tikitiType.headline}>Quantity</Text>
          <Text style={tikitiType.caption}>Up to {MAX_TICKETS} per order</Text>
        </View>
        <Stepper
          value={quantity}
          min={1}
          max={MAX_TICKETS}
          onChange={onQuantityChange}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: policyOpen }}
        onPress={() => setPolicyOpen((open) => !open)}
        style={styles.policy}
      >
        <SymbolView
          name="checkmark.shield"
          size={13}
          weight="semibold"
          tintColor={tikitiColors.textSecondary}
        />
        <Text style={tikitiType.caption}>Refunds, transfers and entry</Text>
        <SymbolView
          name={policyOpen ? 'chevron.down' : 'chevron.right'}
          size={10}
          weight="semibold"
          tintColor={tikitiColors.textSecondary}
        />
      </Pressable>
      {policyOpen && (
        <Text style={tikitiType.caption}>
          Full refund if the show is cancelled or moved. Transfer tickets to
          another phone number up to 24 hours before. Bring your national ID or
          passport; under 18s need an adult.
        </Text>
      )}

      <View style={styles.total}>
        <View style={styles.grow}>
          <Text style={tikitiType.headline}>Total</Text>
          <Text style={tikitiType.caption}>
            {quantity} {quantity === 1 ? 'Ticket' : 'Tickets'} ·{' '}
            {formatPrice(tier.price)} each
          </Text>
        </View>
        <Tray.Morph value={total} transition="scale">
          <Text style={tikitiType.total}>{formatPrice(total)}</Text>
        </Tray.Morph>
      </View>

      <CheckoutTray
        event={show}
        tier={tier}
        quantity={quantity}
        total={total}
        onDone={close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  scroll: {
    maxHeight: 560,
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tikitiColors.separator,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  factValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  tip: {
    paddingHorizontal: 2,
    lineHeight: 22,
    color: tikitiColors.textSecondary,
  },
  priceIdle: {
    color: tikitiColors.textSecondary,
  },
  venue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  routeIcon: {
    width: 28,
    alignItems: 'center',
  },
  rideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.cardPressed,
  },
  driver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.accentTint,
  },
  artist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 2,
  },
  policy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 2,
  },
});
