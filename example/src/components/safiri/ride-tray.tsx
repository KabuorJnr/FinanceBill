import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Tray, useTray } from 'morphlet';

import { SymbolView } from '../symbol-view';
import { PlaygroundTrayHeader } from '../tray-playground/playground-tray-parts';
import { playgroundType } from '../tray-playground/playground.theme';
import {
  DRIVERS,
  PAYMENT_METHODS,
  RIDES,
  distanceKm,
  fareFor,
  formatKES,
  formatKenyanPhone,
  formatKm,
  normalizeKenyanPhone,
  tripMinutes,
  type ICity,
  type IDriver,
  type IPaymentMethod,
  type IPlace,
  type IRide,
  type TPaymentId,
  type TRideId,
} from './kenya.data';
import {
  FactList,
  IconBubble,
  OptionRow,
  SafiriButton,
} from './safiri-tray-parts';
import { SAFIRI_TRAY_CONTENT, safiriColors } from './safiri.theme';

export interface IBooking {
  city: ICity;
  destination: IPlace;
  ride: IRide;
  payment: IPaymentMethod;
  phone: string | null;
  fare: number;
  km: number;
  minutes: number;
  driver: IDriver;
}

interface IRideTrayProps {
  city: ICity;
  place?: IPlace | null;
  children: ReactElement;
  /** Called while the rider picks a destination, so the map can preview it. */
  onDestinationChange: (place: IPlace) => void;
  onBooked: (booking: IBooking) => void;
  onCancel: () => void;
}

interface IDraft {
  destination: IPlace | null;
  rideId: TRideId;
  paymentId: TPaymentId;
  phone: string;
}

const STK_MS = 4200;

export function RideTray({
  city,
  place = null,
  children,
  onDestinationChange,
  onBooked,
  onCancel,
}: IRideTrayProps) {
  const newDraft = (): IDraft => ({
    destination: place,
    rideId: 'boda',
    paymentId: 'mpesa',
    phone: '',
  });
  const [draft, setDraft] = useState<IDraft>(newDraft);
  const [booked, setBooked] = useState(false);

  const update = (patch: Partial<IDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const booking = useMemo<IBooking | null>(() => {
    if (!draft.destination) return null;
    const ride = RIDES.find((option) => option.id === draft.rideId)!;
    const payment = PAYMENT_METHODS.find(
      (option) => option.id === draft.paymentId
    )!;
    const km = distanceKm(city.pickup.coordinate, draft.destination.coordinate);
    return {
      city,
      destination: draft.destination,
      ride,
      payment,
      phone: payment.mobile ? normalizeKenyanPhone(draft.phone) : null,
      fare: fareFor(ride, km),
      km,
      minutes: tripMinutes(ride, km),
      driver: DRIVERS[ride.id],
    };
  }, [city, draft]);

  const confirm = useCallback(() => setBooked(true), []);

  // Hand the trip to the screen only once the tray has fully dismissed, since
  // the screen swaps out the card this tray morphs back into.
  const onDidDismiss = () => {
    if (booked && booking) onBooked(booking);
    else onCancel();
  };

  return (
    <Tray.Root
      defaultView={place ? 'rides' : 'destination'}
      onOpenChange={(open) => {
        if (!open) return;
        setDraft(newDraft());
        setBooked(false);
        if (place) onDestinationChange(place);
      }}
    >
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>

      <Tray.Content {...SAFIRI_TRAY_CONTENT} onDidDismiss={onDidDismiss}>
        <PlaygroundTrayHeader
          views={{
            destination: { title: 'Where to?' },
            rides: { title: draft.destination?.name ?? 'Choose a ride' },
            payment: { title: 'Payment' },
            confirming: { title: 'Check your phone', back: false },
            booked: { title: 'Ride booked', back: false },
          }}
        />
        <Tray.Body>
          <Tray.View name="destination">
            <DestinationView
              city={city}
              selected={draft.destination}
              onSelect={(destination) => {
                update({ destination });
                onDestinationChange(destination);
              }}
            />
          </Tray.View>
          <Tray.View name="rides">
            {booking && (
              <RidesView
                booking={booking}
                onSelect={(rideId) => update({ rideId })}
              />
            )}
          </Tray.View>
          <Tray.View name="payment">
            {booking && (
              <PaymentView
                booking={booking}
                phone={draft.phone}
                onSelect={(paymentId) => update({ paymentId })}
                onPhoneChange={(phone) => update({ phone })}
                onConfirm={confirm}
              />
            )}
          </Tray.View>
          <Tray.View name="confirming">
            {booking && (
              <ConfirmingView booking={booking} onConfirmed={confirm} />
            )}
          </Tray.View>
          <Tray.View name="booked">
            {booking && <BookedView booking={booking} />}
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

interface IDestinationViewProps {
  city: ICity;
  selected: IPlace | null;
  onSelect: (place: IPlace) => void;
}

function DestinationView({ city, selected, onSelect }: IDestinationViewProps) {
  const { setView } = useTray();
  const [query, setQuery] = useState('');

  const term = query.trim().toLowerCase();
  const places = city.places.filter(
    (option) =>
      !term ||
      option.name.toLowerCase().includes(term) ||
      option.area.toLowerCase().includes(term)
  );

  return (
    <View style={styles.page}>
      <View style={styles.search}>
        <SymbolView
          name="magnifyingglass"
          size={16}
          weight="semibold"
          tintColor={safiriColors.label}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Search ${city.name}`}
          placeholderTextColor={safiriColors.label}
          selectionColor={safiriColors.green}
          returnKeyType="search"
          autoCorrect={false}
          style={[playgroundType.value, styles.searchInput]}
        />
      </View>

      <View style={styles.from}>
        <View style={styles.fromDot} />
        <Text style={[playgroundType.caption, styles.muted]} numberOfLines={1}>
          Pickup · {city.pickup.name}, {city.pickup.area}
        </Text>
      </View>

      <Tray.Morph value={term} transition="fade">
        <ScrollView
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {places.length === 0 ? (
            <Text style={[playgroundType.body, styles.empty]}>
              Hatujapata “{query.trim()}”. Try another place in {city.name}.
            </Text>
          ) : (
            places.map((option) => (
              <OptionRow
                key={option.id}
                icon={
                  <IconBubble
                    icon={option.icon}
                    color={safiriColors.green}
                    background={safiriColors.greenTint}
                  />
                }
                title={option.name}
                subtitle={`${option.area} · ${formatKm(
                  distanceKm(city.pickup.coordinate, option.coordinate)
                )}`}
                trailing={
                  option.id === selected?.id ? (
                    <SymbolView
                      name="checkmark"
                      size={14}
                      weight="bold"
                      tintColor={safiriColors.green}
                    />
                  ) : undefined
                }
                onPress={() => {
                  Keyboard.dismiss();
                  onSelect(option);
                  setView('rides');
                }}
              />
            ))
          )}
        </ScrollView>
      </Tray.Morph>
    </View>
  );
}

interface IRidesViewProps {
  booking: IBooking;
  onSelect: (ride: TRideId) => void;
}

function RidesView({ booking, onSelect }: IRidesViewProps) {
  const { setView } = useTray();

  return (
    <View style={styles.page}>
      <View style={styles.summary}>
        <Text
          style={[playgroundType.caption, styles.muted, styles.summaryText]}
          numberOfLines={1}
        >
          {formatKm(booking.km)} from {booking.city.pickup.name} ·{' '}
          {booking.destination.area}
        </Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setView('destination')}
        >
          <Text style={[playgroundType.caption, styles.link]}>Change</Text>
        </Pressable>
      </View>

      <View style={styles.options}>
        {RIDES.map((ride) => (
          <OptionRow
            key={ride.id}
            selected={ride.id === booking.ride.id}
            icon={
              <IconBubble icon={ride.icon} background={safiriColors.card} />
            }
            title={ride.name}
            subtitle={`${ride.pickupMinutes} min away · ${ride.description}`}
            trailing={
              <Text style={[playgroundType.value, styles.text]}>
                {formatKES(fareFor(ride, booking.km))}
              </Text>
            }
            onPress={() => onSelect(ride.id)}
          />
        ))}
      </View>

      <SafiriButton
        label={`Choose ${booking.ride.name}`}
        icon={booking.ride.icon}
        onPress={() => setView('payment')}
      />
    </View>
  );
}

interface IPaymentViewProps {
  booking: IBooking;
  phone: string;
  onSelect: (payment: TPaymentId) => void;
  onPhoneChange: (phone: string) => void;
  onConfirm: () => void;
}

function PaymentView({
  booking,
  phone,
  onSelect,
  onPhoneChange,
  onConfirm,
}: IPaymentViewProps) {
  const { setView } = useTray();
  const { payment } = booking;
  const canPay = !payment.mobile || booking.phone !== null;
  const showError = payment.mobile && phone.length >= 10 && !booking.phone;

  const pay = () => {
    if (!canPay) return;
    Keyboard.dismiss();
    if (payment.mobile) {
      setView('confirming');
    } else {
      onConfirm();
      setView('booked');
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.options}>
        {PAYMENT_METHODS.map((method) => (
          <OptionRow
            key={method.id}
            selected={method.id === payment.id}
            icon={
              <IconBubble
                icon={method.icon}
                color={safiriColors.inverse}
                background={method.color}
              />
            }
            title={method.name}
            subtitle={method.detail}
            onPress={() => onSelect(method.id)}
          />
        ))}
      </View>

      <Tray.Morph value={payment.mobile}>
        {payment.mobile ? (
          <View style={styles.phoneField}>
            <View style={styles.phone}>
              <Text style={[playgroundType.value, styles.prefix]}>🇰🇪 +254</Text>
              <TextInput
                value={phone}
                onChangeText={onPhoneChange}
                placeholder="712 345 678"
                placeholderTextColor={safiriColors.label}
                selectionColor={safiriColors.green}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                maxLength={13}
                returnKeyType="done"
                onSubmitEditing={pay}
                style={[playgroundType.value, styles.phoneInput]}
              />
            </View>
            <Text
              style={[
                playgroundType.caption,
                showError ? styles.error : styles.muted,
              ]}
            >
              {showError
                ? 'Enter a valid Safaricom or Airtel number, e.g. 0712 345 678.'
                : `We’ll send a ${payment.name} prompt to this number.`}
            </Text>
          </View>
        ) : (
          <Text style={[playgroundType.caption, styles.muted]}>
            Please carry exact change where you can.
          </Text>
        )}
      </Tray.Morph>

      <SafiriButton
        label={
          payment.mobile
            ? `Pay ${formatKES(booking.fare)}`
            : `Request ${booking.ride.name}`
        }
        icon={payment.mobile ? 'checkmark.shield' : booking.ride.icon}
        disabled={!canPay}
        onPress={pay}
      />
    </View>
  );
}

interface IConfirmingViewProps {
  booking: IBooking;
  onConfirmed: () => void;
}

function ConfirmingView({ booking, onConfirmed }: IConfirmingViewProps) {
  const { setView } = useTray();
  const progress = useSharedValue(0);

  useEffect(() => {
    const finish = () => {
      onConfirmed();
      setView('booked');
    };
    progress.value = withDelay(
      300,
      withTiming(
        1,
        { duration: STK_MS, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) scheduleOnRN(finish);
        }
      )
    );
  }, [progress, onConfirmed, setView]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.page}>
      <View style={styles.stk}>
        <IconBubble
          icon="iphone"
          size={64}
          color={safiriColors.inverse}
          background={booking.payment.color}
        />
        <Tray.Description style={[playgroundType.body, styles.stkText]}>
          We sent a {booking.payment.name} request for{' '}
          <Text style={styles.text}>{formatKES(booking.fare)}</Text> to{' '}
          <Text style={styles.text}>
            {booking.phone ? formatKenyanPhone(booking.phone) : 'your phone'}
          </Text>
          . Enter your PIN to complete payment.
        </Tray.Description>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            { backgroundColor: booking.payment.color },
            barStyle,
          ]}
        />
      </View>
      <Text style={[playgroundType.caption, styles.muted, styles.center]}>
        Waiting for confirmation…
      </Text>
    </View>
  );
}

function BookedView({ booking }: { booking: IBooking }) {
  const { driver, ride } = booking;
  const initials = driver.name
    .split(' ')
    .map((part) => part[0])
    .join('');

  return (
    <View style={styles.page}>
      <View style={styles.driver}>
        <View style={styles.avatar}>
          <Text style={[playgroundType.value, styles.avatarText]}>
            {initials}
          </Text>
        </View>
        <View style={styles.driverText}>
          <Text style={[playgroundType.value, styles.text]}>{driver.name}</Text>
          <Text
            style={[playgroundType.caption, styles.muted]}
            numberOfLines={1}
          >
            ★ {driver.rating.toFixed(1)} · {driver.vehicle}
          </Text>
        </View>
        <View style={styles.plate}>
          <Text style={styles.plateText}>{driver.plate}</Text>
        </View>
      </View>

      <FactList
        facts={[
          {
            label: 'Arrives in',
            value: `${ride.pickupMinutes} min`,
          },
          { label: 'Drop-off', value: booking.destination.name },
          {
            label: 'Trip',
            value: `${formatKm(booking.km)} · ~${booking.minutes} min`,
          },
          {
            label: booking.payment.mobile ? 'Paid' : 'Pay in cash',
            value: `${formatKES(booking.fare)}${
              booking.payment.mobile ? ` · ${booking.payment.name}` : ''
            }`,
          },
        ]}
      />

      <Tray.Close asChild>
        <SafiriButton label="Sawa, asante!" />
      </Tray.Close>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  text: {
    color: safiriColors.text,
  },
  muted: {
    color: safiriColors.label,
  },
  center: {
    textAlign: 'center',
  },
  error: {
    color: safiriColors.red,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    flex: 1,
  },
  link: {
    fontWeight: '600',
    color: safiriColors.green,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: safiriColors.card,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: safiriColors.text,
  },
  from: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
  },
  fromDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: safiriColors.green,
  },
  list: {
    maxHeight: 340,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
    color: safiriColors.label,
  },
  options: {
    gap: 4,
  },
  phoneField: {
    gap: 8,
  },
  phone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: safiriColors.card,
  },
  prefix: {
    color: safiriColors.text,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    color: safiriColors.text,
  },
  stk: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  stkText: {
    textAlign: 'center',
    color: safiriColors.label,
  },
  track: {
    height: 6,
    marginTop: 8,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: safiriColors.card,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
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
    backgroundColor: safiriColors.greenTint,
  },
  avatarText: {
    color: safiriColors.green,
  },
  driverText: {
    flex: 1,
    gap: 2,
  },
  // Kenyan rear number plates are yellow with black characters.
  plate: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: safiriColors.black,
    backgroundColor: '#FFD200',
  },
  plateText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: safiriColors.black,
  },
});
