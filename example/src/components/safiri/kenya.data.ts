import type { LatLng, Region } from 'react-native-maps';

import type { SFSymbol } from '../symbol-view';

export type TCityId = 'nairobi' | 'mombasa' | 'kisumu' | 'nakuru' | 'eldoret';

export interface IPlace {
  id: string;
  name: string;
  area: string;
  icon: SFSymbol;
  coordinate: LatLng;
}

export interface ICity {
  id: TCityId;
  name: string;
  county: string;
  greeting: string;
  region: Region;
  pickup: IPlace;
  places: IPlace[];
}

function place(
  id: string,
  name: string,
  area: string,
  icon: SFSymbol,
  latitude: number,
  longitude: number
): IPlace {
  return { id, name, area, icon, coordinate: { latitude, longitude } };
}

// Coordinates are approximate and only meant for the demo map.
export const CITIES: ICity[] = [
  {
    id: 'nairobi',
    name: 'Nairobi',
    county: 'Nairobi County',
    greeting: 'Sasa, Nairobi',
    region: {
      latitude: -1.2864,
      longitude: 36.8172,
      latitudeDelta: 0.14,
      longitudeDelta: 0.14,
    },
    pickup: place(
      'nbi-pickup',
      'Kenyatta Avenue',
      'CBD',
      'location.fill',
      -1.2841,
      36.8219
    ),
    places: [
      place('kicc', 'KICC', 'CBD', 'building.columns.fill', -1.2884, 36.8233),
      place('jkia', 'JKIA', 'Embakasi', 'airplane', -1.3192, 36.9278),
      place('sarit', 'Sarit Centre', 'Westlands', 'bag.fill', -1.261, 36.8026),
      place('yaya', 'Yaya Centre', 'Kilimani', 'bag.fill', -1.2925, 36.7874),
      place(
        'junction',
        'The Junction Mall',
        'Ngong Road',
        'cart.fill',
        -1.2985,
        36.7621
      ),
      place('hub', 'The Hub Karen', 'Karen', 'fork.knife', -1.3197, 36.7046),
      place(
        'two-rivers',
        'Two Rivers Mall',
        'Runda',
        'bag.fill',
        -1.2108,
        36.7951
      ),
      place(
        'trm',
        'Thika Road Mall',
        'Roysambu',
        'cart.fill',
        -1.2196,
        36.8886
      ),
      place(
        'kasarani',
        'Kasarani Stadium',
        'Kasarani',
        'sportscourt.fill',
        -1.2219,
        36.893
      ),
      place(
        'nnp',
        'Nairobi National Park',
        'Lang’ata',
        'binoculars.fill',
        -1.317,
        36.83
      ),
      place('uhuru', 'Uhuru Park', 'CBD', 'tree.fill', -1.289, 36.817),
      place('un', 'UN Gigiri', 'Gigiri', 'building.2.fill', -1.2335, 36.8143),
      place(
        'sgr-nbi',
        'SGR Nairobi Terminus',
        'Syokimau',
        'train.side.front.car',
        -1.3633,
        36.9176
      ),
    ],
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    county: 'Mombasa County',
    greeting: 'Karibu Pwani',
    region: {
      latitude: -4.0435,
      longitude: 39.6682,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    },
    pickup: place(
      'msa-pickup',
      'Moi Avenue',
      'Mombasa Island',
      'location.fill',
      -4.0614,
      39.6712
    ),
    places: [
      place(
        'fort-jesus',
        'Fort Jesus',
        'Old Town',
        'building.columns.fill',
        -4.0626,
        39.6795
      ),
      place(
        'old-town',
        'Old Town',
        'Mombasa Island',
        'bag.fill',
        -4.061,
        39.677
      ),
      place(
        'moi-air',
        'Moi International Airport',
        'Port Reitz',
        'airplane',
        -4.0348,
        39.5942
      ),
      place(
        'nyali',
        'Nyali Beach',
        'Nyali',
        'beach.umbrella.fill',
        -4.03,
        39.718
      ),
      place('haller', 'Haller Park', 'Bamburi', 'tree.fill', -4.004, 39.724),
      place('city-mall', 'City Mall', 'Nyali', 'cart.fill', -4.0207, 39.7207),
      place('likoni', 'Likoni Ferry', 'Likoni', 'ferry.fill', -4.0745, 39.665),
      place(
        'sgr-msa',
        'SGR Mombasa Terminus',
        'Miritini',
        'train.side.front.car',
        -4.0129,
        39.5937
      ),
    ],
  },
  {
    id: 'kisumu',
    name: 'Kisumu',
    county: 'Kisumu County',
    greeting: 'Misawa, Kisumu',
    region: {
      latitude: -0.0917,
      longitude: 34.768,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
    pickup: place(
      'ksm-pickup',
      'Oginga Odinga Street',
      'CBD',
      'location.fill',
      -0.1022,
      34.7617
    ),
    places: [
      place(
        'dunga',
        'Dunga Beach',
        'Lake Victoria',
        'ferry.fill',
        -0.1452,
        34.7369
      ),
      place(
        'ksm-air',
        'Kisumu International Airport',
        'Kisumu West',
        'airplane',
        -0.0861,
        34.7289
      ),
      place(
        'ksm-museum',
        'Kisumu Museum',
        'Milimani',
        'building.columns.fill',
        -0.1036,
        34.7553
      ),
      place(
        'impala',
        'Impala Sanctuary',
        'Lake Victoria',
        'binoculars.fill',
        -0.1094,
        34.7486
      ),
      place(
        'mega',
        'Mega City Mall',
        'Kisumu East',
        'cart.fill',
        -0.0931,
        34.7779
      ),
      place(
        'jaramogi',
        'JOOTRH',
        'Kisumu Central',
        'cross.case.fill',
        -0.0994,
        34.7623
      ),
    ],
  },
  {
    id: 'nakuru',
    name: 'Nakuru',
    county: 'Nakuru County',
    greeting: 'Karibu Nakuru City',
    region: {
      latitude: -0.3031,
      longitude: 36.08,
      latitudeDelta: 0.16,
      longitudeDelta: 0.16,
    },
    pickup: place(
      'nak-pickup',
      'Kenyatta Avenue',
      'Town Centre',
      'location.fill',
      -0.2866,
      36.0672
    ),
    places: [
      place(
        'lake-nakuru',
        'Lake Nakuru National Park',
        'Main Gate',
        'binoculars.fill',
        -0.3071,
        36.0757
      ),
      place(
        'menengai',
        'Menengai Crater',
        'Nakuru North',
        'mountain.2.fill',
        -0.2,
        36.07
      ),
      place(
        'westside',
        'Westside Mall',
        'Kenyatta Avenue',
        'cart.fill',
        -0.2864,
        36.0629
      ),
      place(
        'afraha',
        'Afraha Stadium',
        'Nakuru East',
        'sportscourt.fill',
        -0.2826,
        36.0756
      ),
      place(
        'hyrax',
        'Hyrax Hill Museum',
        'Nakuru East',
        'building.columns.fill',
        -0.2795,
        36.1003
      ),
    ],
  },
  {
    id: 'eldoret',
    name: 'Eldoret',
    county: 'Uasin Gishu County',
    greeting: 'Home of Champions',
    region: {
      latitude: 0.5143,
      longitude: 35.2698,
      latitudeDelta: 0.16,
      longitudeDelta: 0.16,
    },
    pickup: place(
      'eld-pickup',
      'Uganda Road',
      'Town Centre',
      'location.fill',
      0.5167,
      35.2733
    ),
    places: [
      place(
        'eld-air',
        'Eldoret International Airport',
        'Kapsoya',
        'airplane',
        0.4045,
        35.2389
      ),
      place(
        'kip-keino',
        'Kipchoge Keino Stadium',
        'Town Centre',
        'sportscourt.fill',
        0.5196,
        35.2717
      ),
      place('mtrh', 'MTRH', 'Nandi Road', 'cross.case.fill', 0.5136, 35.2782),
      place('rupa', 'Rupa Mall', 'Eldoret East', 'cart.fill', 0.5341, 35.3078),
      place(
        'moi-uni',
        'University of Eldoret',
        'Chepkoilel',
        'building.2.fill',
        0.5767,
        35.3093
      ),
    ],
  },
];

export const NAIROBI = CITIES[0]!;

export type TRideId = 'boda' | 'tuktuk' | 'matatu' | 'go' | 'xl';

export interface IRide {
  id: TRideId;
  name: string;
  description: string;
  icon: SFSymbol;
  seats: number;
  base: number;
  perKm: number;
  minimum: number;
  speedKmh: number;
  pickupMinutes: number;
}

export const RIDES: IRide[] = [
  {
    id: 'boda',
    name: 'Boda Boda',
    description: 'Beat the jam. Helmet included.',
    icon: 'scooter',
    seats: 1,
    base: 50,
    perKm: 28,
    minimum: 100,
    speedKmh: 32,
    pickupMinutes: 2,
  },
  {
    id: 'tuktuk',
    name: 'Tuk-Tuk',
    description: 'Short hops around town.',
    icon: 'car.side.fill',
    seats: 3,
    base: 80,
    perKm: 38,
    minimum: 150,
    speedKmh: 24,
    pickupMinutes: 4,
  },
  {
    id: 'matatu',
    name: 'Matatu',
    description: 'Shared ride on the main routes.',
    icon: 'bus.fill',
    seats: 14,
    base: 40,
    perKm: 6,
    minimum: 50,
    speedKmh: 20,
    pickupMinutes: 6,
  },
  {
    id: 'go',
    name: 'Safiri Go',
    description: 'Affordable everyday car.',
    icon: 'car.fill',
    seats: 4,
    base: 150,
    perKm: 45,
    minimum: 250,
    speedKmh: 26,
    pickupMinutes: 3,
  },
  {
    id: 'xl',
    name: 'Safiri XL',
    description: 'Room for the whole family and luggage.',
    icon: 'car.2.fill',
    seats: 6,
    base: 250,
    perKm: 65,
    minimum: 400,
    speedKmh: 26,
    pickupMinutes: 7,
  },
];

export type TPaymentId = 'mpesa' | 'airtel' | 'cash';

export interface IPaymentMethod {
  id: TPaymentId;
  name: string;
  detail: string;
  icon: SFSymbol;
  color: string;
  mobile: boolean;
}

export const PAYMENT_METHODS: IPaymentMethod[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    detail: 'Approve with your M-Pesa PIN',
    icon: 'iphone',
    color: '#2FA84F',
    mobile: true,
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    detail: 'Approve with your Airtel Money PIN',
    icon: 'iphone',
    color: '#E2231A',
    mobile: true,
  },
  {
    id: 'cash',
    name: 'Cash',
    detail: 'Pay your driver at the end',
    icon: 'banknote.fill',
    color: '#0A0A0A',
    mobile: false,
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
  matatu: {
    name: 'Peter Kamau',
    rating: 4.6,
    vehicle: 'Nissan Caravan · Route 46',
    plate: 'KDC 557M',
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
  const straight = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
  return straight * 1.3;
}

export function fareFor(ride: IRide, km: number): number {
  const raw = Math.max(ride.minimum, ride.base + ride.perKm * km);
  return Math.ceil(raw / 10) * 10;
}

export function tripMinutes(ride: IRide, km: number): number {
  return Math.max(3, Math.round((km / ride.speedKmh) * 60));
}

export function formatKES(amount: number): string {
  const whole = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `KSh ${whole}`;
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
