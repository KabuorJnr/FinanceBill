import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import {
  signInWithSocial,
  signOutProviders,
  type TSocialProvider,
} from './auth-providers';
import type { IEvent, IOrganizer } from './events.data';
import { firebase } from './firebase';
import { readJson, writeJson } from './local-store';
import { todayInKenya, venueById } from './tikiti.data';

export interface ISignUp {
  name: string;
  phone: string;
  email: string;
  password: string;
}

/**
 * Where organiser accounts and posted events live. The app talks only to this
 * interface, so the device and Firebase backends are interchangeable.
 */
export interface IEventsBackend {
  kind: 'device' | 'firebase';
  /** Upcoming events posted by every organiser. */
  subscribeEvents(
    onChange: (events: IEvent[]) => void,
    onError: (error: Error) => void
  ): () => void;
  /** The signed-in organiser, or null. */
  subscribeOrganizer(
    onChange: (organizer: IOrganizer | null) => void
  ): () => void;
  signUp(input: ISignUp): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  /** Google or Microsoft. Reports whether the organiser profile is missing. */
  signInWith(provider: TSocialProvider): Promise<{ needsProfile: boolean }>;
  resetPassword(email: string): Promise<void>;
  /** Saves company name and phone for accounts made with Google/Microsoft. */
  completeProfile(profile: { name: string; phone: string }): Promise<void>;
  signOut(): Promise<void>;
  publishEvent(event: IEvent): Promise<void>;
  deleteEvent(id: string): Promise<void>;
}

function relinkVenue(event: IEvent): IEvent {
  return { ...event, venue: venueById(event.venue.id) ?? event.venue };
}

// --- Device: one JSON file, for demos and when Firebase isn't configured ---

interface IDeviceState {
  organizer: IOrganizer | null;
  accounts: IOrganizer[];
  posted: IEvent[];
}

export function createDeviceBackend(): IEventsBackend {
  let state: IDeviceState = { organizer: null, accounts: [], posted: [] };
  let loaded: Promise<void> | null = null;
  const eventListeners = new Set<(events: IEvent[]) => void>();
  const organizerListeners = new Set<(o: IOrganizer | null) => void>();

  const load = () =>
    (loaded ??= (async () => {
      const parsed = await readJson<IDeviceState>('tikiti-events');
      if (!parsed) return;
      state = {
        organizer: parsed.organizer ?? null,
        accounts: parsed.accounts ?? [],
        posted: (parsed.posted ?? []).map(relinkVenue),
      };
    })().catch(() => undefined));

  const emit = () => {
    eventListeners.forEach((listener) => listener(state.posted));
    organizerListeners.forEach((listener) => listener(state.organizer));
  };

  const commit = (next: IDeviceState) => {
    state = next;
    writeJson('tikiti-events', state).catch(() => undefined);
    emit();
  };

  return {
    kind: 'device',
    subscribeEvents(onChange) {
      eventListeners.add(onChange);
      load().then(() => onChange(state.posted));
      return () => eventListeners.delete(onChange);
    },
    subscribeOrganizer(onChange) {
      organizerListeners.add(onChange);
      load().then(() => onChange(state.organizer));
      return () => organizerListeners.delete(onChange);
    },
    async signUp({ name, phone, email }) {
      await load();
      const taken = state.accounts.some(
        (account) => account.email.toLowerCase() === email.toLowerCase()
      );
      if (taken) throw new Error('That email already has an account here.');
      const organizer = {
        id: `device-${Date.now().toString(36)}`,
        name,
        phone,
        email,
      };
      commit({ ...state, organizer, accounts: [...state.accounts, organizer] });
    },
    async signIn(email) {
      await load();
      // Device accounts are a demo: there is no password to check.
      const match = state.accounts.find(
        (account) => account.email.toLowerCase() === email.toLowerCase()
      );
      if (!match)
        throw new Error('No organiser with that email on this phone.');
      commit({ ...state, organizer: match });
    },
    async signInWith() {
      throw new Error(
        'Google and Microsoft sign-in need Firebase. Use email for now.'
      );
    },
    async resetPassword() {
      throw new Error('Password reset needs Firebase.');
    },
    async completeProfile({ name, phone }) {
      await load();
      if (!state.organizer) throw new Error('Sign in first.');
      const organizer = { ...state.organizer, name, phone };
      commit({
        ...state,
        organizer,
        accounts: state.accounts.map((account) =>
          account.id === organizer.id ? organizer : account
        ),
      });
    },
    async signOut() {
      await load();
      commit({ ...state, organizer: null });
    },
    async publishEvent(event) {
      await load();
      commit({
        ...state,
        posted: [
          ...state.posted.filter((existing) => existing.id !== event.id),
          event,
        ],
      });
    },
    async deleteEvent(id) {
      await load();
      commit({
        ...state,
        posted: state.posted.filter((event) => event.id !== id),
      });
    },
  };
}

// --- Firebase: Auth for organiser accounts, Firestore for events ---

export function createFirebaseBackend(): IEventsBackend {
  const { auth, db } = firebase();
  const organizerListeners = new Set<(o: IOrganizer | null) => void>();
  const announce = (organizer: IOrganizer) =>
    organizerListeners.forEach((listener) => listener(organizer));

  const saveProfile = async (organizer: IOrganizer) => {
    await setDoc(doc(db, 'organizers', organizer.id), {
      name: organizer.name,
      phone: organizer.phone,
      email: organizer.email,
      updatedAt: new Date().toISOString(),
    });
    announce(organizer);
  };

  return {
    kind: 'firebase',
    subscribeEvents(onChange, onError) {
      const upcoming = query(
        collection(db, 'events'),
        where('date', '>=', todayInKenya()),
        orderBy('date')
      );
      return onSnapshot(
        upcoming,
        (snapshot) =>
          onChange(
            snapshot.docs.map((document) =>
              relinkVenue({ ...(document.data() as IEvent), id: document.id })
            )
          ),
        onError
      );
    },
    subscribeOrganizer(onChange) {
      organizerListeners.add(onChange);
      const stop = onAuthStateChanged(auth, async (user) => {
        if (!user) return onChange(null);
        const profile = await getDoc(doc(db, 'organizers', user.uid)).catch(
          () => null
        );
        const data = profile?.data() as Omit<IOrganizer, 'id'> | undefined;
        // No phone means the profile still needs completing.
        onChange({
          id: user.uid,
          name: data?.name ?? user.displayName ?? '',
          phone: data?.phone ?? '',
          email: data?.email ?? user.email ?? '',
        });
      });
      return () => {
        organizerListeners.delete(onChange);
        stop();
      };
    },
    async signUp({ name, phone, email, password }) {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(user, { displayName: name }).catch(() => null);
      // Auth fired before the profile existed, so announce the full profile.
      await saveProfile({ id: user.uid, name, phone, email });
    },
    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },
    async signInWith(provider) {
      const { user } = await signInWithSocial(auth, provider);
      const profile = await getDoc(doc(db, 'organizers', user.uid)).catch(
        () => null
      );
      return { needsProfile: !profile?.data()?.phone };
    },
    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email);
    },
    async completeProfile({ name, phone }) {
      const user = auth.currentUser;
      if (!user) throw new Error('Sign in first.');
      await updateProfile(user, { displayName: name }).catch(() => null);
      await saveProfile({ id: user.uid, name, phone, email: user.email ?? '' });
    },
    async signOut() {
      await firebaseSignOut(auth);
      await signOutProviders();
    },
    async publishEvent(event) {
      const user = auth.currentUser;
      if (!user) throw new Error('Sign in to publish events.');
      // Firestore rejects undefined values; a JSON round trip drops them.
      const clean = JSON.parse(JSON.stringify(event)) as IEvent;
      await setDoc(doc(db, 'events', event.id), {
        ...clean,
        organizer: { ...clean.organizer, id: user.uid },
        organizerId: user.uid,
      });
    },
    async deleteEvent(id) {
      await deleteDoc(doc(db, 'events', id));
    },
  };
}
