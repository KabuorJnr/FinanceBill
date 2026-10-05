import { useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Tray, useTray } from 'morphlet';

import { AnimatedTabs } from '../artist/animated-tabs';
import { SymbolView } from '../symbol-view';
import {
  CATEGORIES,
  MAX_TIERS,
  categoryOf,
  type IEvent,
  type IOrganizer,
  type TCategory,
} from './events.data';
import { useEvents } from './events.store';
import {
  CITIES,
  VENUE_LIST,
  addDays,
  customVenue,
  dateParts,
  formatLongDate,
  formatPrice,
  formatTime,
  isValidDate,
  isValidTime,
  normalizeKenyanPhone,
  todayInKenya,
  type ICity,
} from './tikiti.data';
import {
  DateBlock,
  Field,
  Group,
  ListRow,
  Radio,
  TikitiButton,
  TikitiHeader,
  tikitiType,
} from './tikiti-parts';
import { TIKITI_TRAY_CONTENT, tikitiColors } from './tikiti.theme';

interface ITierDraft {
  name: string;
  detail: string;
  price: string;
  capacity: string;
}

interface IEventDraft {
  title: string;
  headliner: string;
  category: TCategory;
  description: string;
  lineup: string;
  cityId: string;
  venueId: string | 'other';
  venueName: string;
  venueArea: string;
  date: string;
  time: string;
  tiers: ITierDraft[];
}

function newEventDraft(): IEventDraft {
  return {
    title: '',
    headliner: '',
    category: 'concert',
    description: '',
    lineup: '',
    cityId: CITIES[0]!.id,
    venueId: '',
    venueName: '',
    venueArea: '',
    date: '',
    time: '19:00',
    tiers: [
      { name: 'Regular', detail: 'General access', price: '', capacity: '' },
    ],
  };
}

const AUTH_TABS = [
  {
    value: 'signUp' as const,
    label: 'Create Account',
    icon: 'person.badge.plus' as const,
  },
  { value: 'signIn' as const, label: 'Sign In', icon: 'person.fill' as const },
];

function cityOf(draft: IEventDraft): ICity {
  return CITIES.find((option) => option.id === draft.cityId) ?? CITIES[0]!;
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function parseAmount(text: string): number | null {
  const digits = text.replace(/[,\s]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  return Number(digits);
}

function validTiers(draft: IEventDraft) {
  return draft.tiers.every(
    (tier) => tier.name.trim() && parseAmount(tier.price) !== null
  );
}

function buildEvent(draft: IEventDraft, organizer: IOrganizer): IEvent {
  const city = cityOf(draft);
  const known = VENUE_LIST.find((option) => option.id === draft.venueId);
  const venue =
    known ?? customVenue(city, draft.venueName.trim(), draft.venueArea.trim());
  const [hours, minutes] = draft.time.split(':');
  return {
    id: `${slug(draft.title)}-${draft.date}-${Date.now().toString(36)}`,
    title: draft.title.trim(),
    headliner: draft.headliner.trim() || undefined,
    category: draft.category,
    description: draft.description.trim(),
    lineup: draft.lineup
      .split(',')
      .map((act) => act.trim())
      .filter(Boolean),
    organizer,
    venue,
    date: draft.date,
    time: `${hours!.padStart(2, '0')}:${minutes}`,
    tiers: draft.tiers.map((tier, index) => {
      const capacity = parseAmount(tier.capacity);
      return {
        id: `tier-${index}`,
        name: tier.name.trim(),
        detail: tier.detail.trim(),
        price: parseAmount(tier.price) ?? 0,
        ...(capacity ? { capacity } : {}),
      };
    }),
    source: 'organizer',
    createdAt: new Date().toISOString(),
  };
}

export function OrganizerTray({ children }: { children: ReactElement }) {
  const { organizer } = useEvents();
  const [draft, setDraft] = useState<IEventDraft>(newEventDraft);
  const [published, setPublished] = useState<IEvent | null>(null);
  const update = (patch: Partial<IEventDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  return (
    <Tray.Root defaultView={organizer ? 'mine' : 'account'}>
      <Tray.Trigger asChild morph>
        {children}
      </Tray.Trigger>

      <Tray.Content {...TIKITI_TRAY_CONTENT}>
        <TikitiHeader
          views={{
            account: { title: 'For Organisers' },
            mine: { title: 'Your Events', back: false },
            details: { title: 'New Event' },
            venue: { title: 'Venue' },
            when: { title: 'Date & Time' },
            tickets: { title: 'Tickets' },
            review: { title: 'Review' },
            published: { title: '', back: false },
          }}
        />
        <Tray.Body>
          <Tray.View name="account">
            <AccountView />
          </Tray.View>
          <Tray.View name="mine">
            <MineView onNew={() => setDraft(newEventDraft())} />
          </Tray.View>
          <Tray.View name="details">
            <DetailsView draft={draft} onChange={update} />
          </Tray.View>
          <Tray.View name="venue">
            <VenueView draft={draft} onChange={update} />
          </Tray.View>
          <Tray.View name="when">
            <WhenView draft={draft} onChange={update} />
          </Tray.View>
          <Tray.View name="tickets">
            <TicketsView draft={draft} onChange={update} />
          </Tray.View>
          <Tray.View name="review">
            <ReviewView draft={draft} onPublished={setPublished} />
          </Tray.View>
          <Tray.View name="published">
            {published && <PublishedView event={published} />}
          </Tray.View>
        </Tray.Body>
      </Tray.Content>
    </Tray.Root>
  );
}

function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={[tikitiType.caption, styles.error]}>{message}</Text>;
}

function friendlyError(error: unknown): string {
  const code = (error as { code?: string }).code ?? '';
  if (code.includes('email-already-in-use'))
    return 'That email already has an account. Sign in instead.';
  if (code.includes('invalid-credential') || code.includes('wrong-password'))
    return 'Email or password is incorrect.';
  if (code.includes('weak-password'))
    return 'Use a password of at least 6 characters.';
  if (code.includes('invalid-email')) return 'Enter a valid email address.';
  if (code.includes('permission-denied'))
    return 'You don’t have permission to do that.';
  if (code.includes('network')) return 'No connection. Try again.';
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function AccountView() {
  const { signUp, signIn, backend } = useEvents();
  const { setView } = useTray();
  const [mode, setMode] = useState<'signUp' | 'signIn'>('signUp');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = normalizeKenyanPhone(phone);
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const canSubmit =
    emailOk &&
    (backend === 'device' || password.length >= 6) &&
    (mode === 'signIn' || (name.trim().length > 1 && normalized !== null));

  const submit = async () => {
    if (!canSubmit || busy) return;
    Keyboard.dismiss();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signUp') {
        await signUp({
          name: name.trim(),
          phone: normalized!,
          email: email.trim(),
          password,
        });
      } else {
        await signIn(email.trim(), password);
      }
      setView('mine');
    } catch (failure) {
      setError(friendlyError(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={tikitiType.caption}>
        Event organisers and promoters can post events, set ticket prices and
        sell through Tikiti.
        {backend === 'device'
          ? ' Firebase isn’t set up yet, so accounts and events stay on this phone.'
          : ''}
      </Text>
      <AnimatedTabs tabs={AUTH_TABS} value={mode} onChange={setMode} />
      <Group>
        {mode === 'signUp' && (
          <>
            <Field
              icon="building.2.fill"
              placeholder="Company or organiser name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Field
              divider
              icon="phone.fill"
              prefix="+254"
              placeholder="712 345 678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={13}
            />
          </>
        )}
        <Field
          divider={mode === 'signUp'}
          icon="envelope.fill"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field
          divider
          icon="checkmark.shield"
          placeholder={
            backend === 'device' ? 'Password (not needed offline)' : 'Password'
          }
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
      </Group>
      <ErrorText message={error} />
      <TikitiButton
        label={
          busy
            ? 'Please wait…'
            : mode === 'signUp'
              ? 'Create Organiser Account'
              : 'Sign In'
        }
        disabled={!canSubmit || busy}
        onPress={submit}
      />
    </View>
  );
}

function MineView({ onNew }: { onNew: () => void }) {
  const { organizer, myEvents, deleteEvent, signOut, backend } = useEvents();
  const { setView } = useTray();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!organizer) return null;

  const remove = async (id: string) => {
    setError(null);
    try {
      await deleteEvent(id);
    } catch (failure) {
      setError(friendlyError(failure));
    }
    setPending(null);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.profile}>
        <View style={styles.profileText}>
          <Text style={tikitiType.headline}>{organizer.name}</Text>
          <Text style={tikitiType.caption}>
            {organizer.email}
            {backend === 'firebase'
              ? ' · Synced with Firebase'
              : ' · This phone only'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={async () => {
            await signOut();
            setView('account');
          }}
        >
          <Text style={[tikitiType.caption, styles.link]}>Sign out</Text>
        </Pressable>
      </View>

      <TikitiButton
        label="Post a New Event"
        icon="plus"
        onPress={() => {
          onNew();
          setView('details');
        }}
      />

      <Text style={tikitiType.section}>
        Upcoming · {myEvents.length}{' '}
        {myEvents.length === 1 ? 'event' : 'events'}
      </Text>
      {myEvents.length === 0 ? (
        <Text style={tikitiType.caption}>
          Nothing posted yet. Your events appear in Tikiti as soon as you
          publish them.
        </Text>
      ) : (
        <Group>
          {myEvents.map((event, index) => (
            <ListRow
              key={event.id}
              divider={index > 0}
              leading={<DateBlock date={event.date} />}
              title={event.title}
              subtitle={`${event.venue.name}, ${event.venue.city.name} · ${formatTime(event.time)}`}
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    pending === event.id ? 'Confirm delete' : 'Delete event'
                  }
                  hitSlop={8}
                  onPress={() =>
                    pending === event.id
                      ? remove(event.id)
                      : setPending(event.id)
                  }
                >
                  {pending === event.id ? (
                    <Text style={[tikitiType.caption, styles.error]}>
                      Delete?
                    </Text>
                  ) : (
                    <SymbolView
                      name="xmark"
                      size={13}
                      weight="bold"
                      tintColor={tikitiColors.textTertiary}
                    />
                  )}
                </Pressable>
              }
            />
          ))}
        </Group>
      )}
      <ErrorText message={error} />
    </ScrollView>
  );
}

interface IStepProps {
  draft: IEventDraft;
  onChange: (patch: Partial<IEventDraft>) => void;
}

function Chips<TValue extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: TValue; label: string }[];
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
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
    </View>
  );
}

function DetailsView({ draft, onChange }: IStepProps) {
  const { setView } = useTray();
  const valid = draft.title.trim().length >= 3;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <Group>
        <Field
          icon="ticket.fill"
          placeholder="Event name"
          value={draft.title}
          onChangeText={(title) => onChange({ title })}
          maxLength={60}
        />
        <Field
          divider
          icon="music.mic"
          placeholder="Headline act (optional)"
          value={draft.headliner}
          onChangeText={(headliner) => onChange({ headliner })}
          maxLength={40}
        />
      </Group>

      <Text style={tikitiType.section}>Category</Text>
      <Chips
        options={CATEGORIES}
        value={draft.category}
        onChange={(category) => onChange({ category })}
      />

      <Group>
        <Field
          icon="text.bubble"
          placeholder="What should people know?"
          value={draft.description}
          onChangeText={(description) => onChange({ description })}
          multiline
          maxLength={400}
          style={styles.multiline}
        />
        <Field
          divider
          icon="person.3.fill"
          placeholder="Line-up, separated by commas"
          value={draft.lineup}
          onChangeText={(lineup) => onChange({ lineup })}
        />
      </Group>

      <TikitiButton
        label="Next: Venue"
        disabled={!valid}
        onPress={() => {
          Keyboard.dismiss();
          setView('venue');
        }}
      />
    </ScrollView>
  );
}

function VenueView({ draft, onChange }: IStepProps) {
  const { setView } = useTray();
  const city = cityOf(draft);
  const venues = VENUE_LIST.filter((option) => option.city.id === city.id);
  const isOther = draft.venueId === 'other';
  const valid = isOther
    ? draft.venueName.trim().length >= 2
    : venues.some((option) => option.id === draft.venueId);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <Chips
        options={CITIES.map((option) => ({
          value: option.id,
          label: option.name,
        }))}
        value={city.id}
        onChange={(cityId) => onChange({ cityId, venueId: '' })}
      />
      <Group>
        {venues.map((option, index) => (
          <ListRow
            key={option.id}
            divider={index > 0}
            selected={option.id === draft.venueId}
            leading={<Radio selected={option.id === draft.venueId} />}
            title={option.name}
            subtitle={option.area}
            onPress={() => onChange({ venueId: option.id })}
          />
        ))}
        <ListRow
          divider
          selected={isOther}
          leading={<Radio selected={isOther} />}
          title="Another venue"
          subtitle={`Anywhere in ${city.name}`}
          onPress={() => onChange({ venueId: 'other' })}
        />
      </Group>
      {isOther && (
        <Group>
          <Field
            icon="mappin.and.ellipse"
            placeholder="Venue name"
            value={draft.venueName}
            onChangeText={(venueName) => onChange({ venueName })}
          />
          <Field
            divider
            icon="map.fill"
            placeholder="Area or estate"
            value={draft.venueArea}
            onChangeText={(venueArea) => onChange({ venueArea })}
          />
        </Group>
      )}
      <TikitiButton
        label="Next: Date & Time"
        disabled={!valid}
        onPress={() => {
          Keyboard.dismiss();
          setView('when');
        }}
      />
    </ScrollView>
  );
}

/** The next few Fridays to Sundays, as quick picks. */
function weekendDates(): string[] {
  const today = todayInKenya();
  const dates: string[] = [];
  for (let offset = 1; dates.length < 6 && offset < 30; offset++) {
    const date = addDays(today, offset);
    if (['FRI', 'SAT', 'SUN'].includes(dateParts(date).weekday)) {
      dates.push(date);
    }
  }
  return dates;
}

function WhenView({ draft, onChange }: IStepProps) {
  const { setView } = useTray();
  const dateOk = isValidDate(draft.date) && draft.date >= todayInKenya();
  const timeOk = isValidTime(draft.time);

  return (
    <View style={styles.page}>
      <Text style={tikitiType.section}>Coming weekends</Text>
      <View style={styles.chips}>
        {weekendDates().map((date) => {
          const { weekday, day, monthShort } = dateParts(date);
          const selected = draft.date === date;
          return (
            <Pressable
              key={date}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange({ date })}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[tikitiType.caption, selected && styles.chipText]}>
                {weekday} {day} {monthShort}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Group>
        <Field
          icon="calendar"
          placeholder="Date, e.g. 2026-12-19"
          value={draft.date}
          onChangeText={(date) => onChange({ date: date.trim() })}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <Field
          divider
          icon="clock.fill"
          placeholder="Start time, e.g. 19:30"
          value={draft.time}
          onChangeText={(time) => onChange({ time: time.trim() })}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />
      </Group>
      <Text
        style={[tikitiType.caption, !dateOk && !!draft.date && styles.error]}
      >
        {dateOk
          ? `${formatLongDate(draft.date)}${timeOk ? ` at ${formatTime(draft.time)}` : ''}`
          : draft.date
            ? 'Use a future date written as YYYY-MM-DD.'
            : 'Pick a weekend or type a date.'}
      </Text>
      <TikitiButton
        label="Next: Tickets"
        disabled={!dateOk || !timeOk}
        onPress={() => {
          Keyboard.dismiss();
          setView('tickets');
        }}
      />
    </View>
  );
}

function TicketsView({ draft, onChange }: IStepProps) {
  const { setView } = useTray();
  const setTier = (index: number, patch: Partial<ITierDraft>) =>
    onChange({
      tiers: draft.tiers.map((tier, position) =>
        position === index ? { ...tier, ...patch } : tier
      ),
    });

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={tikitiType.caption}>
        Prices in KSh. Use 0 for free tickets. Leave capacity empty for no
        limit.
      </Text>
      {draft.tiers.map((tier, index) => (
        <View key={index} style={styles.tier}>
          <View style={styles.tierHeader}>
            <Text style={tikitiType.section}>Ticket type {index + 1}</Text>
            {draft.tiers.length > 1 && (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() =>
                  onChange({
                    tiers: draft.tiers.filter(
                      (_, position) => position !== index
                    ),
                  })
                }
              >
                <Text style={[tikitiType.caption, styles.error]}>Remove</Text>
              </Pressable>
            )}
          </View>
          <Group>
            <Field
              icon="ticket.fill"
              placeholder="Name, e.g. VIP"
              value={tier.name}
              onChangeText={(name) => setTier(index, { name })}
              maxLength={30}
            />
            <Field
              divider
              icon="info.circle"
              placeholder="What’s included"
              value={tier.detail}
              onChangeText={(detail) => setTier(index, { detail })}
              maxLength={60}
            />
            <Field
              divider
              icon="banknote.fill"
              prefix="KSh"
              placeholder="Price"
              value={tier.price}
              onChangeText={(price) => setTier(index, { price })}
              keyboardType="number-pad"
              maxLength={7}
            />
            <Field
              divider
              icon="person.2.fill"
              placeholder="Capacity (optional)"
              value={tier.capacity}
              onChangeText={(capacity) => setTier(index, { capacity })}
              keyboardType="number-pad"
              maxLength={6}
            />
          </Group>
        </View>
      ))}
      {draft.tiers.length < MAX_TIERS && (
        <TikitiButton
          label="Add Ticket Type"
          icon="plus"
          variant="secondary"
          onPress={() =>
            onChange({
              tiers: [
                ...draft.tiers,
                { name: '', detail: '', price: '', capacity: '' },
              ],
            })
          }
        />
      )}
      <TikitiButton
        label="Next: Review"
        disabled={!validTiers(draft)}
        onPress={() => {
          Keyboard.dismiss();
          setView('review');
        }}
      />
    </ScrollView>
  );
}

function ReviewView({
  draft,
  onPublished,
}: {
  draft: IEventDraft;
  onPublished: (event: IEvent) => void;
}) {
  const { organizer, publishEvent, backend } = useEvents();
  const { setView } = useTray();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!organizer) return null;
  const event = buildEvent(draft, organizer);
  const category = categoryOf(event.category);

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      await publishEvent(event);
      onPublished(event);
      setView('published');
    } catch (failure) {
      setError(friendlyError(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
      <Group>
        <ListRow
          leading={<DateBlock date={event.date} />}
          title={event.title}
          subtitle={`${category.label} · ${event.organizer.name}`}
        />
        <ListRow
          divider
          title={event.venue.name}
          subtitle={`${event.venue.area}, ${event.venue.city.name} · ${formatTime(event.time)}`}
        />
      </Group>
      {!!event.description && (
        <Text style={tikitiType.caption}>{event.description}</Text>
      )}
      <Group>
        {event.tiers.map((tier, index) => (
          <ListRow
            key={tier.id}
            divider={index > 0}
            title={tier.name}
            subtitle={[
              tier.detail,
              tier.capacity ? `${tier.capacity} available` : '',
            ]
              .filter(Boolean)
              .join(' · ')}
            trailing={
              <Text style={tikitiType.body}>{formatPrice(tier.price)}</Text>
            }
          />
        ))}
      </Group>
      <Text style={tikitiType.caption}>
        {backend === 'firebase'
          ? 'Publishing makes this event visible to everyone on Tikiti.'
          : 'Firebase isn’t set up yet, so this event is only visible on this phone.'}
      </Text>
      <ErrorText message={error} />
      <TikitiButton
        label={busy ? 'Publishing…' : 'Publish Event'}
        icon="paperplane.fill"
        disabled={busy}
        onPress={publish}
      />
      {busy && <ActivityIndicator color={tikitiColors.text} />}
    </ScrollView>
  );
}

function PublishedView({ event }: { event: IEvent }) {
  const { setView } = useTray();
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
        Your Event Is Live
      </Tray.Title>
      <Tray.Description style={[tikitiType.caption, styles.centerText]}>
        {event.title} on {formatLongDate(event.date)} at {event.venue.name} is
        now on Tikiti. Fans can buy tickets with M-Pesa straight away.
      </Tray.Description>
      <View style={styles.buttons}>
        <TikitiButton
          label="Your Events"
          variant="secondary"
          onPress={() => setView('mine')}
        />
        <Tray.Close asChild>
          <TikitiButton label="Done" />
        </Tray.Close>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  scroll: {
    maxHeight: 600,
  },
  center: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  error: {
    color: tikitiColors.accent,
  },
  link: {
    color: tikitiColors.accent,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: tikitiColors.card,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tier: {
    gap: 8,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
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
