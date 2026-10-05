import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tray } from 'morphlet';

import { TrayAlertHeader } from '../tray-playground/playground-tray-parts';
import { playgroundType } from '../tray-playground/playground.theme';
import { formatKES } from './kenya.data';
import type { IBooking } from './ride-tray';
import { IconBubble, SafiriButton } from './safiri-tray-parts';
import { SAFIRI_TRAY_CONTENT, safiriColors } from './safiri.theme';

interface ITripCardProps {
  trip: IBooking;
  onCancel: () => void;
}

export function TripCard({ trip, onCancel }: ITripCardProps) {
  const { driver, ride } = trip;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <IconBubble
          icon={ride.icon}
          size={48}
          color={safiriColors.inverse}
          background={safiriColors.green}
        />
        <View style={styles.text}>
          <Text style={[playgroundType.caption, styles.muted]}>
            {driver.name.split(' ')[0]} arrives in {ride.pickupMinutes} min
          </Text>
          <Text style={[playgroundType.title, styles.title]} numberOfLines={1}>
            {trip.destination.name}
          </Text>
          <Text
            style={[playgroundType.caption, styles.muted]}
            numberOfLines={1}
          >
            {driver.plate} · {driver.vehicle}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.fare}>
          <Text style={[playgroundType.caption, styles.muted]}>
            {trip.payment.mobile ? `Paid · ${trip.payment.name}` : 'Cash'}
          </Text>
          <Text style={[playgroundType.value, styles.title]}>
            {formatKES(trip.fare)}
          </Text>
        </View>
        <CancelTripTray trip={trip} onCancel={onCancel} />
      </View>
    </View>
  );
}

function CancelTripTray({ trip, onCancel }: ITripCardProps) {
  const [cancelled, setCancelled] = useState(false);

  return (
    <Tray.Root onOpenChange={(open) => open && setCancelled(false)}>
      <Tray.Trigger asChild morph>
        <SafiriButton label="Cancel trip" variant="danger" />
      </Tray.Trigger>

      <Tray.Content
        {...SAFIRI_TRAY_CONTENT}
        onDidDismiss={() => cancelled && onCancel()}
      >
        <TrayAlertHeader
          icon="exclamationmark.triangle"
          color={safiriColors.red}
        />
        <Tray.Body>
          <View style={styles.alert}>
            <Tray.Title style={[playgroundType.heading, styles.title]}>
              Cancel this trip?
            </Tray.Title>
            <Tray.Description style={[playgroundType.body, styles.muted]}>
              {trip.driver.name} is already on the way.
              {trip.payment.mobile
                ? ` Your ${formatKES(trip.fare)} will be refunded to ${trip.payment.name}.`
                : ''}
            </Tray.Description>
          </View>
        </Tray.Body>
        <Tray.Footer style={styles.actions}>
          <Tray.Close asChild>
            <SafiriButton label="Keep ride" variant="secondary" />
          </Tray.Close>
          <Tray.Close asChild>
            <SafiriButton
              label="Cancel"
              variant="danger"
              onPress={() => setCancelled(true)}
            />
          </Tray.Close>
        </Tray.Footer>
      </Tray.Content>
    </Tray.Root>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  fare: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: safiriColors.text,
  },
  muted: {
    color: safiriColors.label,
  },
  alert: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
});
