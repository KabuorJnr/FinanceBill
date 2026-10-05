import type { LatLng, Region } from 'react-native-maps';

import type { SFSymbol } from '../symbol-view';

// The artist, tour, line-up and prices are fictional and only for the demo.
// Venue coordinates are approximate.

export interface ICity {
  id: string;
  name: string;
  /** Stand-in for the rider's current location in this city. */
  origin: { name: string; coordinate: LatLng };
}

export interface IVenue {
  id: string;
  name: string;
  area: string;
  city: ICity;
  coordinate: LatLng;
  tip: string;
}

function city(
  id: string,
  name: string,
  origin: string,
  latitude: number,
  longitude: number
): ICity {
  return {
    id,
    name,
    origin: { name: origin, coordinate: { latitude, longitude } },
  };
}

export const NAIROBI = city(
  'nairobi',
  'Nairobi',
  'Kenyatta Avenue, CBD',
  -1.2841,
  36.8219
);
export const MOMBASA = city(
  'mombasa',
  'Mombasa',
  'Moi Avenue',
  -4.0614,
  39.6712
);
export const KISUMU = city(
  'kisumu',
  'Kisumu',
  'Oginga Odinga Street',
  -0.1022,
  34.7617
);
export const NAKURU = city(
  'nakuru',
  'Nakuru',
  'Kenyatta Avenue',
  -0.2866,
  36.0672
);
export const ELDORET = city(
  'eldoret',
  'Eldoret',
  'Uganda Road',
  0.5167,
  35.2733
);

function venue(
  id: string,
  name: string,
  area: string,
  venueCity: ICity,
  latitude: number,
  longitude: number,
  tip: string
): IVenue {
  return {
    id,
    name,
    area,
    city: venueCity,
    coordinate: { latitude, longitude },
    tip,
  };
}

export const VENUES = {
  kasarani: venue(
    'kasarani',
    'Kasarani Stadium',
    'Kasarani',
    NAIROBI,
    -1.2219,
    36.893,
    'Thika Road jams on show nights. Leave early or take a boda for the last stretch.'
  ),
  uhuruGardens: venue(
    'uhuru-gardens',
    'Uhuru Gardens',
    'Lang’ata',
    NAIROBI,
    -1.3184,
    36.8039,
    'Parking on Lang’ata Road fills up fast. Arrive before gates open.'
  ),
  fortJesus: venue(
    'fort-jesus',
    'Fort Jesus',
    'Old Town',
    MOMBASA,
    -4.0626,
    39.6795,
    'Old Town streets are narrow. Tuk-tuks drop off right at the gate.'
  ),
  mamaNgina: venue(
    'mama-ngina',
    'Mama Ngina Waterfront',
    'Mombasa Island',
    MOMBASA,
    -4.0705,
    39.677,
    'Expect crowds along the waterfront on New Year’s Eve. Walk if you can.'
  ),
  jomoGround: venue(
    'jomo-ground',
    'Jomo Kenyatta Sports Ground',
    'Kisumu Central',
    KISUMU,
    -0.0989,
    34.7576,
    'The grounds are a short walk from the CBD. Gates open at 5:00 PM.'
  ),
  afraha: venue(
    'afraha',
    'Afraha Stadium',
    'Nakuru East',
    NAKURU,
    -0.2826,
    36.0756,
    'Matatus to Afraha leave from the main stage every few minutes.'
  ),
  kipKeino: venue(
    'kip-keino',
    'Kipchoge Keino Stadium',
    'Town Centre',
    ELDORET,
    0.5196,
    35.2717,
    'Evenings get cold in Eldoret. Bring a jacket for the walk back.'
  ),
} satisfies Record<string, IVenue>;

const MORE_VENUES: IVenue[] = [
  venue(
    'kicc',
    'KICC',
    'CBD',
    NAIROBI,
    -1.2884,
    36.8233,
    'CBD parking is scarce after 5 PM. Matatus stop on Moi Avenue.'
  ),
  venue(
    'carnivore',
    'Carnivore Grounds',
    'Lang’ata',
    NAIROBI,
    -1.3275,
    36.8065,
    'Lang’ata Road backs up on event nights. Arrive early.'
  ),
  venue(
    'ngong-racecourse',
    'Ngong Racecourse',
    'Ngong Road',
    NAIROBI,
    -1.3047,
    36.7425,
    'Use the Ngong Road entrance. Parking is on the grass.'
  ),
  venue(
    'nyayo',
    'Nyayo National Stadium',
    'South B',
    NAIROBI,
    -1.3045,
    36.8247,
    'Mombasa Road gets busy before kick-off. Leave early.'
  ),
  venue(
    'national-theatre',
    'Kenya National Theatre',
    'CBD',
    NAIROBI,
    -1.2783,
    36.8156,
    'Next to the University of Nairobi. Easy to reach by matatu.'
  ),
  venue(
    'sarit-expo',
    'Sarit Expo Centre',
    'Westlands',
    NAIROBI,
    -1.261,
    36.8026,
    'Park in the Sarit Centre basement.'
  ),
  venue(
    'msa-sports-club',
    'Mombasa Sports Club',
    'Tudor',
    MOMBASA,
    -4.0558,
    39.672,
    'A short tuk-tuk ride from the CBD.'
  ),
  venue(
    'dunga',
    'Dunga Beach',
    'Lake Victoria',
    KISUMU,
    -0.1452,
    34.7369,
    'The road to Dunga is unlit at night. Take a ride back.'
  ),
  venue(
    'menengai',
    'Menengai Crater',
    'Nakuru North',
    NAKURU,
    -0.2,
    36.07,
    'The crater road is steep and rough. A 4x4 helps.'
  ),
];

export const CITIES = [NAIROBI, MOMBASA, KISUMU, NAKURU, ELDORET];

export const VENUE_LIST: IVenue[] = [...Object.values(VENUES), ...MORE_VENUES];

export function venueById(id: string): IVenue | undefined {
  return VENUE_LIST.find((option) => option.id === id);
}

/** A venue an organiser typed in. Pinned at the city centre until geocoded. */
export function customVenue(
  venueCity: ICity,
  name: string,
  area: string
): IVenue {
  return {
    id: `custom-${venueCity.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    area: area || venueCity.name,
    city: venueCity,
    coordinate: venueCity.origin.coordinate,
    tip: 'Location is approximate. Check the organiser’s directions before you leave.',
  };
}

export const MAX_TICKETS = 8;

export type TTravelMode = 'ride' | 'drive' | 'walk' | 'matatu';

export const TRAVEL_MODES: {
  value: TTravelMode;
  label: string;
  icon: SFSymbol;
  speedKmh: number;
}[] = [
  { value: 'ride', label: 'Ride', icon: 'car.fill', speedKmh: 26 },
  { value: 'drive', label: 'Drive', icon: 'steeringwheel', speedKmh: 28 },
  { value: 'walk', label: 'Walk', icon: 'figure.walk', speedKmh: 4.5 },
  { value: 'matatu', label: 'Matatu', icon: 'bus.fill', speedKmh: 18 },
];

export type TRideId = 'boda' | 'tuktuk' | 'go' | 'xl';

export interface IRide {
  id: TRideId;
  name: string;
  description: string;
  icon: SFSymbol;
  base: number;
  perKm: number;
  minimum: number;
  pickupMinutes: number;
}

export const RIDES: IRide[] = [
  {
    id: 'boda',
    name: 'Boda Boda',
    description: 'Beat the jam. Helmet included.',
    icon: 'scooter',
    base: 50,
    perKm: 28,
    minimum: 100,
    pickupMinutes: 2,
  },
  {
    id: 'tuktuk',
    name: 'Tuk-Tuk',
    description: 'Up to 3 people.',
    icon: 'car.side.fill',
    base: 80,
    perKm: 38,
    minimum: 150,
    pickupMinutes: 4,
  },
  {
    id: 'go',
    name: 'Car',
    description: 'Everyday ride, up to 4.',
    icon: 'car.fill',
    base: 150,
    perKm: 45,
    minimum: 250,
    pickupMinutes: 3,
  },
  {
    id: 'xl',
    name: 'Car XL',
    description: 'Room for the whole squad, up to 6.',
    icon: 'car.2.fill',
    base: 250,
    perKm: 65,
    minimum: 400,
    pickupMinutes: 6,
  },
];

export interface IDriver {
  name: string;
  rating: number;
  vehicle: string;
  plate: string;
}

export const DRIVERS: Record<TRideId, IDriver> = {
  boda: {
    name: 'Kevin Otieno',
    rating: 4.8,
    vehicle: 'Boxer 150',
    plate: 'KMFB 214Y',
  },
  tuktuk: {
    name: 'Mwanaisha Said',
    rating: 4.9,
    vehicle: 'Bajaj RE',
    plate: 'KTWA 832K',
  },
  go: {
    name: 'Wanjiku Mwangi',
    rating: 4.9,
    vehicle: 'Toyota Axio · Silver',
    plate: 'KDJ 482T',
  },
  xl: {
    name: 'Kiprop Kiptoo',
    rating: 4.7,
    vehicle: 'Toyota Noah · White',
    plate: 'KDK 109H',
  },
};

export type TPaymentId = 'mpesa' | 'airtel';

export const PAYMENT_METHODS: {
  value: TPaymentId;
  label: string;
  icon: SFSymbol;
}[] = [
  { value: 'mpesa', label: 'M-Pesa', icon: 'iphone' },
  { value: 'airtel', label: 'Airtel Money', icon: 'iphone' },
];

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function distanceKm(from: LatLng, to: LatLng): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) ** 2;
  // Roads are never straight, so pad the great-circle distance.
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a)) * 1.3;
}

export function travelMinutes(mode: TTravelMode, km: number): number {
  const speed = TRAVEL_MODES.find((option) => option.value === mode)!.speedKmh;
  return Math.max(2, Math.round((km / speed) * 60));
}

export function fareFor(ride: IRide, km: number): number {
  const raw = Math.max(ride.minimum, ride.base + ride.perKm * km);
  return Math.ceil(raw / 10) * 10;
}

/** A gentle arc between two points, so the route reads as a path. */
export function routeBetween(from: LatLng, to: LatLng, steps = 32): LatLng[] {
  const dLat = to.latitude - from.latitude;
  const dLng = to.longitude - from.longitude;
  const control = {
    latitude: from.latitude + dLat / 2 - dLng * 0.18,
    longitude: from.longitude + dLng / 2 + dLat * 0.18,
  };

  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const u = 1 - t;
    return {
      latitude:
        u * u * from.latitude +
        2 * u * t * control.latitude +
        t * t * to.latitude,
      longitude:
        u * u * from.longitude +
        2 * u * t * control.longitude +
        t * t * to.longitude,
    };
  });
}

/** The smallest region that shows every point, with some breathing room. */
export function regionFor(points: LatLng[], minDelta = 0.012): Region {
  const lats = points.map((point) => point.latitude);
  const lngs = points.map((point) => point.longitude);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(minDelta, (maxLat - minLat) * 1.7),
    longitudeDelta: Math.max(minDelta, (maxLng - minLng) * 1.7),
  };
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function dateParts(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(year!, month! - 1, day!)).getUTCDay();
  const monthName = MONTHS[month! - 1]!;
  return {
    year: String(year),
    day: String(day),
    weekday: DAYS[weekday]!,
    month: monthName,
    monthShort: monthName.slice(0, 3),
  };
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours! >= 12 ? 'PM' : 'AM';
  return `${hours! % 12 || 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function formatLongDate(date: string): string {
  const { weekday, day, month, year } = dateParts(date);
  const longDay = {
    SUN: 'Sunday',
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
  }[weekday];
  return `${longDay}, ${day} ${month} ${year}`;
}

export function groupByMonth<T extends { date: string }>(items: T[]) {
  const groups: { month: string; items: T[] }[] = [];
  for (const item of items) {
    const { month, year } = dateParts(item.date);
    const label = `${month} ${year}`;
    const group = groups.find((existing) => existing.month === label);
    if (group) group.items.push(item);
    else groups.push({ month: label, items: [item] });
  }
  return groups;
}

/** Today in East Africa Time as YYYY-MM-DD. */
export function todayInKenya(now = new Date()): string {
  const eat = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return eat.toISOString().slice(0, 10);
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month! - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidTime(value: string): boolean {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  return !!match && Number(match[1]) < 24 && Number(match[2]) < 60;
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day! + days));
  return next.toISOString().slice(0, 10);
}

export function formatKES(amount: number): string {
  const whole = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `KSh ${whole}`;
}

export function formatPrice(amount: number): string {
  return amount === 0 ? 'Free' : formatKES(amount);
}

export function formatKm(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

const KENYAN_MOBILE = /^(?:\+?254|0)?([71]\d{8})$/;

/** Returns the number as 2547XXXXXXXX / 2541XXXXXXXX, or null if invalid. */
export function normalizeKenyanPhone(input: string): string | null {
  const match = input.replace(/[\s-]/g, '').match(KENYAN_MOBILE);
  return match ? `254${match[1]}` : null;
}

export function formatKenyanPhone(normalized: string): string {
  const local = `0${normalized.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

// Approximate M-Pesa send-money tariff bands (upper limit, cost) in KES.
const SEND_MONEY_COSTS: [number, number][] = [
  [100, 0],
  [500, 7],
  [1000, 13],
  [1500, 23],
  [2500, 33],
  [3500, 53],
  [5000, 57],
  [7500, 78],
  [10000, 90],
  [15000, 100],
  [20000, 105],
];

export function sendMoneyCost(amount: number): number {
  return SEND_MONEY_COSTS.find(([limit]) => amount <= limit)?.[1] ?? 108;
}
