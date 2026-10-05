import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Tray, useTray } from 'morphlet';
import type { LatLng } from 'react-native-maps';

import { SymbolView } from '../symbol-view';
import {
  HOTEL_KINDS,
  describeHotel,
  hotelsByRegion,
  hotelsNear,
  roomsFor,
  type IHotel,
} from './hotels.data';
import {
  distanceKm,
  formatKES,
  formatKm,
  formatLongDate,
  travelMinutes,
  type IVenue,
} from './tikiti.data';
import {
  Group,
  ListRow,
  PinMap,
  Radio,
  Stepper,
  TikitiButton,
  tikitiType,
} from './tikiti-parts';
import { tikitiColors } from './tikiti.theme';

export interface IStay {
  roomId: string;
  nights: number;
  rooms: number;
}

export const NEW_STAY: IStay = { roomId: 'standard', nights: 1, rooms: 1 };

function roomOf(hotel: IHotel, stay: IStay) {
  const rooms = roomsFor(hotel);
  return rooms.find((room) => room.id === stay.roomId) ?? rooms[0]!;
}

function pluralize(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

const HOTEL_COLOR = '#0A84FF';

function openDirectionsTo({ latitude, longitude }: LatLng) {
  const google = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
      : google;
  Linking.openURL(url).catch(() => Linking.openURL(google));
}

function HotelIcon({ hotel }: { hotel: IHotel }) {
  return (
    <View style={styles.icon}>
      <SymbolView
        name={HOTEL_KINDS[hotel.kind].icon}
        size={16}
        weight="semibold"
        tintColor={tikitiColors.text}
      />
    </View>
  );
}

function HotelRow({
  hotel,
  detail,
  divider,
  onPress,
}: {
  hotel: IHotel;
  detail: string;
  divider: boolean;
  onPress: () => void;
}) {
  return (
    <ListRow
      divider={divider}
      leading={<HotelIcon hotel={hotel} />}
      title={hotel.name}
      subtitle={detail}
      trailing={
        <View style={styles.rate}>
          <Text style={[tikitiType.caption, styles.price]}>
            {formatKES(hotel.from)}
          </Text>
          <Text style={tikitiType.caption}>/ night</Text>
        </View>
      }
      chevron
      onPress={onPress}
    />
  );
}

export function NearbyHotelsView({
  venue,
  onSelect,
}: {
  venue: IVenue;
  onSelect: (hotel: IHotel) => void;
}) {
  const { setView } = useTray();
  const nearby = hotelsNear(venue.coordinate);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      <Text style={tikitiType.caption}>
        Nearest to {venue.name} first. Rates are per room per night and only
        indicative.
      </Text>
      <Group>
        {nearby.map(({ hotel, km }, index) => (
          <HotelRow
            key={hotel.id}
            hotel={hotel}
            divider={index > 0}
            detail={`${formatKm(km)} away · ${hotel.area} · ${hotel.class}`}
            onPress={() => {
              onSelect(hotel);
              setView('hotel');
            }}
          />
        ))}
      </Group>
    </ScrollView>
  );
}

export function AllHotelsView({
  onSelect,
}: {
  onSelect: (hotel: IHotel) => void;
}) {
  const { setView } = useTray();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      {hotelsByRegion().map(({ region, hotels }) => (
        <View key={region} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={tikitiType.title}>{region}</Text>
            <Text style={tikitiType.caption}>{hotels.length} places</Text>
          </View>
          <Group>
            {hotels.map((hotel, index) => (
              <HotelRow
                key={hotel.id}
                hotel={hotel}
                divider={index > 0}
                detail={`${hotel.area}, ${hotel.town} · ${hotel.class}`}
                onPress={() => {
                  onSelect(hotel);
                  setView('hotel');
                }}
              />
            ))}
          </Group>
        </View>
      ))}
      <Text style={tikitiType.caption}>
        A selection of well-known places to stay, not a full directory. Rates
        are indicative.
      </Text>
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

interface IHotelViewProps {
  hotel: IHotel;
  stay: IStay;
  onStayChange: (stay: IStay) => void;
  /** The concert the guest is staying for, if any. */
  venue?: IVenue;
  checkIn?: string;
}

export function HotelView({
  hotel,
  stay,
  onStayChange,
  venue,
  checkIn,
}: IHotelViewProps) {
  const { setView } = useTray();
  const km = venue ? distanceKm(hotel.coordinate, venue.coordinate) : null;
  const room = roomOf(hotel, stay);
  const total = room.nightly * stay.nights * stay.rooms;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      <PinMap
        height={120}
        pins={[
          {
            coordinate: hotel.coordinate,
            icon: HOTEL_KINDS[hotel.kind].icon,
            color: HOTEL_COLOR,
          },
          ...(venue
            ? [{ coordinate: venue.coordinate, icon: 'ticket.fill' as const }]
            : []),
        ]}
      />
      <Group>
        <Fact label="Where" value={`${hotel.area}, ${hotel.town}`} />
        <Fact label="Type" value={describeHotel(hotel)} divider />
        {venue && km !== null && (
          <Fact
            label={`To ${venue.name}`}
            value={`${formatKm(km)} · ~${travelMinutes('ride', km)} min`}
            divider
          />
        )}
        {checkIn && (
          <Fact label="Check-in" value={formatLongDate(checkIn)} divider />
        )}
      </Group>

      <Text style={tikitiType.section}>Room Type · Nightly Rate</Text>
      <Group>
        {roomsFor(hotel).map((option, index) => (
          <ListRow
            key={option.id}
            divider={index > 0}
            selected={option.id === room.id}
            leading={<Radio selected={option.id === room.id} />}
            title={option.name}
            subtitle={`${option.detail} · ${option.mealPlan}`}
            trailing={
              <View style={styles.rate}>
                <Text style={tikitiType.headline}>
                  {formatKES(option.nightly)}
                </Text>
                <Text style={tikitiType.caption}>per night</Text>
              </View>
            }
            onPress={() => onStayChange({ ...stay, roomId: option.id })}
          />
        ))}
      </Group>

      <Group>
        <StepperRow
          title="Nights"
          value={stay.nights}
          max={14}
          onChange={(nights) => onStayChange({ ...stay, nights })}
        />
        <StepperRow
          divider
          title="Rooms"
          value={stay.rooms}
          max={5}
          onChange={(rooms) => onStayChange({ ...stay, rooms })}
        />
      </Group>

      <View style={styles.total}>
        <View style={styles.grow}>
          <Text style={tikitiType.headline}>Estimated total</Text>
          <Text style={tikitiType.caption}>
            {formatKES(room.nightly)} × {pluralize(stay.nights, 'night')} ×{' '}
            {pluralize(stay.rooms, 'room')}
          </Text>
        </View>
        <Tray.Morph value={total} transition="scale">
          <Text style={tikitiType.total}>{formatKES(total)}</Text>
        </Tray.Morph>
      </View>

      <View style={styles.buttons}>
        <TikitiButton
          label="Directions"
          icon="arrow.triangle.turn.up.right.diamond.fill"
          variant="secondary"
          onPress={() => openDirectionsTo(hotel.coordinate)}
        />
        <TikitiButton
          label="Reserve"
          icon="bed.double.fill"
          onPress={() => setView('stay')}
        />
      </View>
      <Text style={tikitiType.caption}>
        Rates are indicative and change with season and availability. The hotel
        confirms the final price.
      </Text>
    </ScrollView>
  );
}

function StepperRow({
  title,
  value,
  max,
  divider,
  onChange,
}: {
  title: string;
  value: number;
  max: number;
  divider?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <View style={[styles.stepperRow, divider && styles.divider]}>
      <Text style={[tikitiType.headline, styles.grow]}>{title}</Text>
      <Stepper value={value} min={1} max={max} onChange={onChange} />
    </View>
  );
}

export function StayView({
  hotel,
  stay,
  checkIn,
}: {
  hotel: IHotel;
  stay: IStay;
  checkIn?: string;
}) {
  const room = roomOf(hotel, stay);
  const total = room.nightly * stay.nights * stay.rooms;

  return (
    <View style={[styles.page, styles.center]}>
      <View style={styles.check}>
        <SymbolView
          name="bed.double.fill"
          size={26}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      </View>
      <Tray.Title style={[tikitiType.title, styles.doneTitle]}>
        Karibu! Room Reserved
      </Tray.Title>
      <Tray.Description style={[tikitiType.caption, styles.centerText]}>
        {pluralize(stay.rooms, room.name)} ({room.mealPlan.toLowerCase()}) for{' '}
        {pluralize(stay.nights, 'night')} at {hotel.name}
        {checkIn ? `, from ${formatLongDate(checkIn)}` : ''}.{'\n'}
        {formatKES(room.nightly)} per night, estimated {formatKES(total)} in
        total, paid at the hotel with M-Pesa or card. Demo only, no booking is
        made.
      </Tray.Description>
      <View style={styles.fullWidth}>
        <Tray.Close asChild>
          <TikitiButton label="Done" />
        </Tray.Close>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginTop: 6,
  },
  page: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  scroll: {
    maxHeight: 560,
  },
  rate: {
    alignItems: 'flex-end',
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
  center: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HOTEL_COLOR,
  },
  price: {
    color: tikitiColors.text,
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: 'rgba(10, 132, 255, 0.25)',
    backgroundColor: HOTEL_COLOR,
  },
  doneTitle: {
    fontSize: 24,
  },
});
