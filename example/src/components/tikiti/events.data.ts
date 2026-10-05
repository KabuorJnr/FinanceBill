import type { SFSymbol } from '../symbol-view';
import { VENUES, venueById, type IVenue } from './tikiti.data';

// Organisers, artists, events and prices below are fictional demo data.

export type TCategory =
  'concert' | 'festival' | 'comedy' | 'sports' | 'culture' | 'conference';

export const CATEGORIES: {
  value: TCategory;
  label: string;
  icon: SFSymbol;
  color: string;
}[] = [
  { value: 'concert', label: 'Concert', icon: 'music.note', color: '#E8264A' },
  {
    value: 'festival',
    label: 'Festival',
    icon: 'party.popper.fill',
    color: '#E07A00',
  },
  {
    value: 'comedy',
    label: 'Comedy',
    icon: 'theatermasks.fill',
    color: '#8E44AD',
  },
  { value: 'sports', label: 'Sports', icon: 'trophy.fill', color: '#00875A' },
  {
    value: 'culture',
    label: 'Culture',
    icon: 'building.columns.fill',
    color: '#C9942A',
  },
  {
    value: 'conference',
    label: 'Conference',
    icon: 'person.3.fill',
    color: '#1F6FEB',
  },
];

export function categoryOf(value: TCategory) {
  return CATEGORIES.find((category) => category.value === value)!;
}

export interface IOrganizer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface ITier {
  id: string;
  name: string;
  detail: string;
  price: number;
  /** Tickets available; undefined means not limited. */
  capacity?: number;
}

export interface IEvent {
  id: string;
  title: string;
  /** The main act, shown on tickets. Falls back to the title. */
  headliner?: string;
  category: TCategory;
  description: string;
  lineup: string[];
  organizer: IOrganizer;
  venue: IVenue;
  /** ISO date in East Africa Time. */
  date: string;
  time: string;
  tiers: ITier[];
  /** Events that belong to one tour share this id. */
  tourId?: string;
  /** Seed data ships with the app; organiser events are posted in it. */
  source: 'seed' | 'organizer';
  createdAt: string;
}

export const MAX_TIERS = 5;

export function lowestPrice(event: IEvent): number {
  return Math.min(...event.tiers.map((tier) => tier.price));
}

export function displayName(event: IEvent): string {
  return event.headliner || event.title;
}

export function initialsOf(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}

function organizer(id: string, name: string): IOrganizer {
  return { id, name, phone: '', email: '' };
}

const SAUTI_LIVE = organizer('sauti-live', 'Sauti Live Entertainment');
const MTAA_EVENTS = organizer('mtaa-events', 'Mtaa Events Co.');
const CHEKA_KENYA = organizer('cheka-kenya', 'Cheka Kenya');
const SAFARI_JAZZ = organizer('safari-jazz', 'Safari Jazz Society');
const PWANI_ARTS = organizer('pwani-arts', 'Pwani Arts Collective');
const RIFT_RUNNERS = organizer('rift-runners', 'Rift Runners Club');
const TECH_HUB = organizer('savannah-tech', 'Savannah Tech Week');

const CONCERT_TIERS: ITier[] = [
  {
    id: 'ga',
    name: 'General Admission',
    detail: 'Standing room on the floor',
    price: 2500,
  },
  {
    id: 'reserved',
    name: 'Reserved Seat',
    detail: 'In the stands, assigned seat',
    price: 4000,
  },
  {
    id: 'pit',
    name: 'Front Pit',
    detail: 'Closest to the stage',
    price: 7500,
  },
  {
    id: 'vip',
    name: 'VIP Package',
    detail: 'Early entry and a merch bundle',
    price: 15000,
  },
];

function tiers(...list: [name: string, detail: string, price: number][]) {
  return list.map(([name, detail, price], index) => ({
    id: `tier-${index}`,
    name,
    detail,
    price,
  }));
}

export const NYOTA_TOUR = {
  id: 'nyota-sauti-ya-mtaa',
  artist: 'Nyota',
  title: 'Sauti ya Mtaa Tour 2026',
  genre: 'Afro-pop · Benga',
  bio: 'Nyota grew up between Kibera and Kisumu, mixing benga guitar with Afro-pop and Sheng hooks. The Sauti ya Mtaa tour takes the new songs to five cities.',
  latest: { title: 'Mtaa Wetu', kind: 'Single', date: '12 Sep 2026' },
  songs: [
    { title: 'Mtaa Wetu', album: 'Mtaa Wetu · Single', year: '2026' },
    { title: 'Nairobi Nights', album: 'Jua Kali', year: '2025' },
    { title: 'Pole Pole', album: 'Jua Kali', year: '2025' },
    { title: 'Lamu Sunset', album: 'Pwani', year: '2024' },
  ],
};

function tourStop(venue: IVenue, date: string, time = '19:30'): IEvent {
  return {
    id: `nyota-${venue.id}-${date}`,
    title: `Nyota: ${NYOTA_TOUR.title}`,
    headliner: NYOTA_TOUR.artist,
    category: 'concert',
    description:
      'Nyota brings the Sauti ya Mtaa tour home, with a full band and special guests in every city.',
    lineup: ['Nyota', 'Special guests'],
    organizer: SAUTI_LIVE,
    venue,
    date,
    time,
    tiers: CONCERT_TIERS,
    tourId: NYOTA_TOUR.id,
    source: 'seed',
    createdAt: '2026-09-01T00:00:00Z',
  };
}

function seed(
  id: string,
  event: Omit<IEvent, 'id' | 'source' | 'createdAt' | 'venue'> & {
    venueId: string;
  }
): IEvent {
  const { venueId, ...rest } = event;
  return {
    ...rest,
    id,
    venue: venueById(venueId)!,
    source: 'seed',
    createdAt: '2026-09-01T00:00:00Z',
  };
}

export const SEED_EVENTS: IEvent[] = [
  tourStop(VENUES.kasarani, '2026-10-29'),
  tourStop(VENUES.uhuruGardens, '2026-11-06'),
  tourStop(VENUES.uhuruGardens, '2026-11-07'),
  tourStop(VENUES.fortJesus, '2026-11-14', '19:00'),
  tourStop(VENUES.fortJesus, '2026-11-15', '19:00'),
  tourStop(VENUES.jomoGround, '2026-11-21', '18:30'),
  tourStop(VENUES.afraha, '2026-11-22', '18:30'),
  tourStop(VENUES.kipKeino, '2026-11-28', '18:00'),
  tourStop(VENUES.kasarani, '2026-12-12', '20:00'),
  tourStop(VENUES.mamaNgina, '2026-12-31', '21:00'),
  seed('nairobi-sound-fest', {
    title: 'Nairobi Sound Fest',
    category: 'festival',
    description:
      'A full day of Afrobeats, amapiano and gengetone across three stages, with food from all 47 counties.',
    lineup: ['DJ Kalonje Jr.', 'Sauti Collective', 'The Mtaa Band'],
    organizer: MTAA_EVENTS,
    venueId: 'uhuru-gardens',
    date: '2026-10-24',
    time: '14:00',
    tiers: tiers(
      ['Regular', 'General access', 2500],
      ['VIP', 'Fast-track entry and VIP area', 6000],
      ['VVIP', 'Front stage, lounge and two drinks', 15000]
    ),
  }),
  seed('cheka-nights', {
    title: 'Cheka Nights Live',
    category: 'comedy',
    description:
      'Stand-up in English, Kiswahili and Sheng. Strictly 18+. Nyama choma all night.',
    lineup: ['MC Makena', 'Otieno Wa Mtaa', 'Kibet the Comic'],
    organizer: CHEKA_KENYA,
    venueId: 'carnivore',
    date: '2026-11-06',
    time: '19:30',
    tiers: tiers(
      ['Regular', 'Free seating', 1500],
      ['VIP', 'Front tables', 3500]
    ),
  }),
  seed('racecourse-jazz', {
    title: 'Jazz at the Racecourse',
    category: 'concert',
    description:
      'An afternoon of jazz and soul on the lawns. Picnic blankets welcome.',
    lineup: ['Nairobi Horns Section', 'Wambui Soul Trio'],
    organizer: SAFARI_JAZZ,
    venueId: 'ngong-racecourse',
    date: '2026-11-21',
    time: '13:00',
    tiers: tiers(
      ['Lawn', 'Bring a blanket', 3000],
      ['Terrace', 'Covered seating', 7500]
    ),
  }),
  seed('sauti-za-pwani', {
    title: 'Sauti za Pwani',
    category: 'culture',
    description:
      'Taarab and coastal bango under the walls of Fort Jesus as the sun sets.',
    lineup: ['Zuhura & Taarab Ensemble', 'Bango Brothers'],
    organizer: PWANI_ARTS,
    venueId: 'fort-jesus',
    date: '2026-11-08',
    time: '17:00',
    tiers: tiers(
      ['Regular', 'General access', 1500],
      ['VIP', 'Reserved seating', 4000]
    ),
  }),
  seed('menengai-run', {
    title: 'Menengai Sunrise Run',
    category: 'sports',
    description:
      '10 km and 21 km routes along the crater rim. Bib, medal and breakfast included.',
    lineup: ['10 km fun run', '21 km half marathon'],
    organizer: RIFT_RUNNERS,
    venueId: 'menengai',
    date: '2026-11-01',
    time: '06:00',
    tiers: tiers(
      ['10 km', 'Bib, medal and breakfast', 1800],
      ['21 km', 'Bib, medal, breakfast and T-shirt', 3500]
    ),
  }),
  seed('savannah-tech', {
    title: 'Savannah Tech Week',
    category: 'conference',
    description:
      'Three days of talks and workshops on fintech, agritech and mobile money.',
    lineup: ['Keynotes', 'Startup pitch day', 'Workshops'],
    organizer: TECH_HUB,
    venueId: 'kicc',
    date: '2026-11-17',
    time: '09:00',
    tiers: tiers(
      ['Student', 'Valid student ID required', 0],
      ['Standard', 'All talks', 5000],
      ['Pro', 'Talks, workshops and lunch', 12000]
    ),
  }),
];
