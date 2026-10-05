import { useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Tray, useTray } from 'morphlet';

import { AnimatedTabs } from '../artist/animated-tabs';
import { SymbolView } from '../symbol-view';
import {
  PAYMENT_METHODS,
  dateParts,
  formatKES,
  formatPrice,
  formatKenyanPhone,
  formatTime,
  normalizeKenyanPhone,
  type TPaymentId,
} from './tikiti.data';
import { displayName, type IEvent, type ITier } from './events.data';
import {
  Field,
  Group,
  TikitiButton,
  TikitiHeader,
  tikitiType,
} from './tikiti-parts';
import { TIKITI_TRAY_CONTENT, tikitiColors } from './tikiti.theme';

const STK_MS = 4000;

interface ICheckoutTrayProps {
  event: IEvent;
  tier: ITier;
  quantity: number;
  total: number;
  /** Closes the tray underneath once the order is done. */
  onDone: () => void;
}

interface IBuyer {
  name: string;
  phone: string;
  payment: TPaymentId;
}

const NEW_BUYER: IBuyer = { name: '', phone: '', payment: 'mpesa' };

export function CheckoutTray({
  event: show,
  tier,
  quantity,
  total,
  onDone,
}: ICheckoutTrayProps) {
  const [buyer, setBuyer] = useState<IBuyer>(NEW_BUYER);
  const [finished, setFinished] = useState(false);
  const phone = normalizeKenyanPhone(buyer.phone);
  const payment = PAYMENT_METHODS.find(
    (method) => method.value === buyer.payment
  )!;

  const order = {
    show,
    tier,
    quantity,
    total,
    name: buyer.name.trim(),
    phone,
    paymentLabel: payment.label,
    paymentColor:
      buyer.payment === 'mpesa' ? tikitiColors.mpesa : tikitiColors.airtel,
  };

  return (
    <Tray.Root
      defaultView="form"
      onOpenChange={(open) => {
        if (!open) return;
        setBuyer(NEW_BUYER);
        setFinished(false);
      }}
    >
      <Tray.Trigger asChild morph>
        <TikitiButton label="Continue" />
      </Tray.Trigger>

      <Tray.Content
        stack
        {...TIKITI_TRAY_CONTENT}
        onDidDismiss={() => finished && onDone()}
      >
        <TikitiHeader
          views={{
            form: { title: 'Checkout', back: false },
            paying: { title: 'Check Your Phone', back: false },
            done: { title: '', back: false },
          }}
        />
        <Tray.Body>
          <Tray.View name="form">
            <FormView
              order={order}
              buyer={buyer}
              onChange={(patch) =>
                setBuyer((current) => ({ ...current, ...patch }))
              }
            />
          </Tray.View>
          <Tray.View name="paying">
            <PayingView order={order} />
          </Tray.View>
          <Tray.View name="done">
            <DoneView order={order} onFinish={() => setFinished(true)} />
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

interface IOrder {
  show: IEvent;
  tier: ITier;
  quantity: number;
  total: number;
  name: string;
  phone: string | null;
  paymentLabel: string;
  paymentColor: string;
}

function Summary({ order }: { order: IOrder }) {
  const { monthShort, day } = dateParts(order.show.date);
  return (
    <View style={styles.summary}>
      <View style={styles.summaryIcon}>
        <SymbolView
          name="ticket.fill"
          size={18}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      </View>
      <View style={styles.grow}>
        <Text style={tikitiType.headline}>{order.tier.name}</Text>
        <Text style={tikitiType.caption}>
          {order.quantity} {order.quantity === 1 ? 'Ticket' : 'Tickets'} ·{' '}
          {monthShort.toUpperCase()} {day} · {formatTime(order.show.time)}
        </Text>
      </View>
      <Text style={tikitiType.headline}>{formatPrice(order.total)}</Text>
    </View>
  );
}

interface IFormViewProps {
  order: IOrder;
  buyer: IBuyer;
  onChange: (patch: Partial<IBuyer>) => void;
}

function FormView({ order, buyer, onChange }: IFormViewProps) {
  const { setView } = useTray();
  const canPay = order.name.length > 0 && order.phone !== null;
  const phoneDigits = buyer.phone.replace(/\D/g, '').length;
  const showError = phoneDigits >= 9 && order.phone === null;

  const confirm = () => {
    if (!canPay) return;
    Keyboard.dismiss();
    // Free tickets skip the mobile money prompt.
    setView(order.total === 0 ? 'done' : 'paying');
  };

  return (
    <View style={styles.page}>
      <Text style={tikitiType.caption}>Demo only. Nothing is charged.</Text>
      <Summary order={order} />

      <Text style={tikitiType.section}>Send Tickets To</Text>
      <Group>
        <Field
          icon="person.fill"
          placeholder="Full Name"
          value={buyer.name}
          onChangeText={(name) => onChange({ name })}
          autoCapitalize="words"
          textContentType="name"
          autoComplete="name"
          returnKeyType="next"
        />
        <Field
          divider
          icon="phone.fill"
          prefix="+254"
          placeholder="712 345 678"
          value={buyer.phone}
          onChangeText={(phone) => onChange({ phone })}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          maxLength={13}
          returnKeyType="done"
          onSubmitEditing={confirm}
        />
      </Group>
      <Text style={[tikitiType.caption, showError && styles.error]}>
        {showError
          ? 'Enter a valid Safaricom or Airtel number, e.g. 0712 345 678.'
          : 'Your e-tickets arrive by SMS on this number.'}
      </Text>

      {order.total > 0 && (
        <>
          <Text style={tikitiType.section}>Pay With</Text>
          <AnimatedTabs
            tabs={PAYMENT_METHODS}
            value={buyer.payment}
            onChange={(payment) => onChange({ payment })}
          />
        </>
      )}

      <TikitiButton
        label="Confirm Order"
        icon="checkmark"
        disabled={!canPay}
        onPress={confirm}
      />
    </View>
  );
}

function PayingView({ order }: { order: IOrder }) {
  const { view, setView } = useTray();
  const progress = useSharedValue(0);
  const active = view === 'paying';

  useEffect(() => {
    if (!active) return;
    const finish = () => setView('done');
    progress.value = 0;
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
  }, [active, progress, setView]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={[styles.page, styles.center]}>
      <View
        style={[styles.phoneBadge, { backgroundColor: order.paymentColor }]}
      >
        <SymbolView
          name="iphone"
          size={30}
          weight="semibold"
          tintColor={tikitiColors.text}
        />
      </View>
      <Text style={[tikitiType.body, styles.centerText]}>
        We sent an {order.paymentLabel} request for{' '}
        <Text style={tikitiType.headline}>{formatKES(order.total)}</Text> to{' '}
        <Text style={tikitiType.headline}>
          {order.phone ? formatKenyanPhone(order.phone) : 'your phone'}
        </Text>
        . Enter your PIN to pay.
      </Text>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            { backgroundColor: order.paymentColor },
            barStyle,
          ]}
        />
      </View>
      <Text style={tikitiType.caption}>Waiting for confirmation…</Text>
    </View>
  );
}

function DoneView({
  order,
  onFinish,
}: {
  order: IOrder;
  onFinish: () => void;
}) {
  const { view } = useTray();
  const { month, day } = dateParts(order.show.date);

  // Remember the order is complete even if the tray is swiped away.
  const finish = useRef(onFinish);
  useEffect(() => {
    finish.current = onFinish;
  });
  useEffect(() => {
    if (view === 'done') finish.current();
  }, [view]);

  return (
    <View style={[styles.page, styles.center]}>
      <View style={styles.check}>
        <SymbolView
          name="checkmark"
          size={30}
          weight="bold"
          tintColor={tikitiColors.text}
        />
      </View>
      <Tray.Title style={[tikitiType.title, styles.doneTitle]}>
        Uko Ndani! You’re Going
      </Tray.Title>
      <Tray.Description style={[tikitiType.caption, styles.centerText]}>
        {displayName(order.show)} at {order.show.venue.name}, {month} {day}.
        {'\n'}
        {order.quantity} {order.quantity === 1 ? 'Ticket' : 'Tickets'},{' '}
        {order.tier.name}, sent to{' '}
        {order.phone ? formatKenyanPhone(order.phone) : 'your phone'} by SMS.
      </Tray.Description>
      <Tray.Close asChild>
        <TikitiButton label="Done" />
      </Tray.Close>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 20,
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
  error: {
    color: tikitiColors.accent,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tikitiColors.kenyaRed,
  },
  phoneBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    alignSelf: 'stretch',
    height: 6,
    marginTop: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: tikitiColors.card,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: tikitiColors.accentTint,
    backgroundColor: tikitiColors.accent,
  },
  doneTitle: {
    fontSize: 24,
  },
});
