import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createDeviceBackend,
  createFirebaseBackend,
  type IEventsBackend,
  type ISignUp,
} from './events.backend';
import { SEED_EVENTS, type IEvent, type IOrganizer } from './events.data';
import { isFirebaseConfigured } from './firebase';
import { todayInKenya } from './tikiti.data';

interface IEventsContext {
  /** Every upcoming event, seed and posted, soonest first. */
  events: IEvent[];
  organizer: IOrganizer | null;
  /** Upcoming events posted by the signed-in organiser. */
  myEvents: IEvent[];
  /** Where posted events are stored. */
  backend: IEventsBackend['kind'];
  ready: boolean;
  error: string | null;
  signUp: (input: ISignUp) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  publishEvent: (event: IEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const EventsContext = createContext<IEventsContext | null>(null);

function byDate(a: IEvent, b: IEvent) {
  return (a.date + a.time).localeCompare(b.date + b.time);
}

function defaultBackend(): IEventsBackend {
  return isFirebaseConfigured ? createFirebaseBackend() : createDeviceBackend();
}

export function EventsProvider({
  children,
  backend: backendProp,
}: {
  children: ReactNode;
  backend?: IEventsBackend;
}) {
  const [backend] = useState(() => backendProp ?? defaultBackend());
  const [posted, setPosted] = useState<IEvent[]>([]);
  const [organizer, setOrganizer] = useState<IOrganizer | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stopEvents = backend.subscribeEvents(
      (next) => {
        setPosted(next);
        setReady(true);
        setError(null);
      },
      (failure) => {
        setReady(true);
        setError(failure.message);
      }
    );
    const stopOrganizer = backend.subscribeOrganizer(setOrganizer);
    return () => {
      stopEvents();
      stopOrganizer();
    };
  }, [backend]);

  const value = useMemo<IEventsContext>(() => {
    const today = todayInKenya();
    const events = [...SEED_EVENTS, ...posted]
      .filter((event) => event.date >= today)
      .sort(byDate);
    return {
      events,
      organizer,
      myEvents: organizer
        ? events.filter((event) => event.organizer.id === organizer.id)
        : [],
      backend: backend.kind,
      ready,
      error,
      signUp: (input) => backend.signUp(input),
      signIn: (email, password) => backend.signIn(email, password),
      signOut: () => backend.signOut(),
      publishEvent: (event) => backend.publishEvent(event),
      deleteEvent: (id) => backend.deleteEvent(id),
    };
  }, [backend, posted, organizer, ready, error]);

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEvents(): IEventsContext {
  const context = useContext(EventsContext);
  if (!context) throw new Error('useEvents must be used in <EventsProvider>');
  return context;
}
