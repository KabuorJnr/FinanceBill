import type { LatLng } from 'react-native-maps';

import type { SFSymbol } from '../symbol-view';
import { distanceKm } from './tikiti.data';

// Well-known hotels, resorts and lodges around Kenya. This is a curated demo
// list, not a complete directory: coordinates are approximate and nightly
// rates are rough indications, not quotes.

export type TRegion =
  | 'Nairobi'
  | 'Coast'
  | 'Western & Nyanza'
  | 'Rift Valley'
  | 'Mount Kenya & Central'
  | 'Safari Parks';

export const REGIONS: TRegion[] = [
  'Nairobi',
  'Coast',
  'Western & Nyanza',
  'Rift Valley',
  'Mount Kenya & Central',
  'Safari Parks',
];

export type THotelKind = 'hotel' | 'resort' | 'lodge' | 'camp';
export type THotelClass = 'Luxury' | 'Upscale' | 'Mid-range' | 'Budget';

export interface IHotel {
  id: string;
  name: string;
  area: string;
  town: string;
  region: TRegion;
  kind: THotelKind;
  class: THotelClass;
  /** Indicative nightly rate in KES for one room. */
  from: number;
  coordinate: LatLng;
}

export const HOTEL_KINDS: Record<
  THotelKind,
  { label: string; icon: SFSymbol }
> = {
  hotel: { label: 'Hotel', icon: 'bed.double.fill' },
  resort: { label: 'Beach resort', icon: 'beach.umbrella.fill' },
  lodge: { label: 'Lodge', icon: 'leaf.fill' },
  camp: { label: 'Tented camp', icon: 'tent.fill' },
};

type THotelRow = [
  id: string,
  name: string,
  area: string,
  town: string,
  kind: THotelKind,
  hotelClass: THotelClass,
  from: number,
  latitude: number,
  longitude: number,
];

function rows(region: TRegion, list: THotelRow[]): IHotel[] {
  return list.map(
    ([id, name, area, town, kind, hotelClass, from, latitude, longitude]) => ({
      id,
      name,
      area,
      town,
      region,
      kind,
      class: hotelClass,
      from,
      coordinate: { latitude, longitude },
    })
  );
}

// prettier-ignore
export const HOTELS: IHotel[] = [
  ...rows('Nairobi', [
    ['sarova-stanley', 'The Sarova Stanley', 'CBD', 'Nairobi', 'hotel', 'Upscale', 18000, -1.2838, 36.8233],
    ['norfolk', 'Fairmont The Norfolk', 'Harry Thuku Road', 'Nairobi', 'hotel', 'Luxury', 32000, -1.2795, 36.8152],
    ['nairobi-serena', 'Nairobi Serena Hotel', 'Central Park', 'Nairobi', 'hotel', 'Luxury', 30000, -1.2905, 36.819],
    ['panafric', 'Sarova Panafric', 'Kenyatta Avenue', 'Nairobi', 'hotel', 'Upscale', 15000, -1.2928, 36.8137],
    ['meridian', 'Best Western Plus Meridian', 'CBD', 'Nairobi', 'hotel', 'Mid-range', 11000, -1.283, 36.825],
    ['radisson-upperhill', 'Radisson Blu Hotel Upper Hill', 'Upper Hill', 'Nairobi', 'hotel', 'Upscale', 22000, -1.2994, 36.8105],
    ['kempinski', 'Villa Rosa Kempinski', 'Chiromo', 'Nairobi', 'hotel', 'Luxury', 35000, -1.269, 36.809],
    ['jw-marriott', 'JW Marriott Hotel Nairobi', 'Westlands', 'Nairobi', 'hotel', 'Luxury', 38000, -1.2662, 36.8095],
    ['sankara', 'Sankara Nairobi', 'Westlands', 'Nairobi', 'hotel', 'Luxury', 28000, -1.2648, 36.8037],
    ['movenpick', 'Mövenpick Hotel & Residences', 'Westlands', 'Nairobi', 'hotel', 'Upscale', 24000, -1.2655, 36.8065],
    ['park-inn', 'Park Inn by Radisson Westlands', 'Westlands', 'Nairobi', 'hotel', 'Mid-range', 13000, -1.264, 36.806],
    ['ibis-westlands', 'ibis Styles Nairobi Westlands', 'Westlands', 'Nairobi', 'hotel', 'Budget', 8000, -1.263, 36.803],
    ['radisson-arboretum', 'Radisson Blu Hotel & Residence Arboretum', 'Kileleshwa', 'Nairobi', 'hotel', 'Upscale', 20000, -1.2733, 36.807],
    ['tribe', 'Tribe Hotel', 'Gigiri', 'Nairobi', 'hotel', 'Luxury', 30000, -1.2338, 36.803],
    ['trademark', 'Trademark Hotel', 'Village Market', 'Nairobi', 'hotel', 'Upscale', 20000, -1.23, 36.805],
    ['safari-park', 'Safari Park Hotel', 'Thika Road', 'Nairobi', 'hotel', 'Upscale', 16000, -1.2235, 36.8836],
    ['boma', 'The Boma Nairobi', 'South C', 'Nairobi', 'hotel', 'Mid-range', 13000, -1.317, 36.828],
    ['weston', 'Weston Hotel', 'Lang’ata Road', 'Nairobi', 'hotel', 'Mid-range', 12000, -1.311, 36.813],
    ['tamarind-tree', 'Tamarind Tree Hotel', 'Lang’ata', 'Nairobi', 'hotel', 'Mid-range', 12000, -1.329, 36.802],
    ['ole-sereni', 'Ole Sereni', 'Mombasa Road', 'Nairobi', 'hotel', 'Upscale', 18000, -1.324, 36.846],
    ['eka-nairobi', 'Eka Hotel Nairobi', 'Mombasa Road', 'Nairobi', 'hotel', 'Mid-range', 12000, -1.318, 36.84],
    ['crowne-airport', 'Crowne Plaza Nairobi Airport', 'Embakasi', 'Nairobi', 'hotel', 'Upscale', 17000, -1.324, 36.887],
    ['four-points-jkia', 'Four Points by Sheraton Nairobi Airport', 'JKIA', 'Nairobi', 'hotel', 'Upscale', 18000, -1.329, 36.925],
    ['hemingways-nairobi', 'Hemingways Nairobi', 'Karen', 'Nairobi', 'hotel', 'Luxury', 60000, -1.327, 36.713],
    ['giraffe-manor', 'Giraffe Manor', 'Lang’ata', 'Nairobi', 'lodge', 'Luxury', 120000, -1.377, 36.746],
  ]),
  ...rows('Coast', [
    ['royal-court', 'Royal Court Hotel', 'CBD', 'Mombasa', 'hotel', 'Mid-range', 8000, -4.0603, 39.668],
    ['castle-royal', 'Sentrim Castle Royal Hotel', 'Moi Avenue', 'Mombasa', 'hotel', 'Mid-range', 9000, -4.0617, 39.6715],
    ['english-point', 'English Point Marina', 'Nyali', 'Mombasa', 'hotel', 'Upscale', 20000, -4.042, 39.685],
    ['voyager', 'Voyager Beach Resort', 'Nyali', 'Mombasa', 'resort', 'Upscale', 18000, -4.017, 39.721],
    ['nyali-beach', 'Nyali International Beach Hotel', 'Nyali', 'Mombasa', 'resort', 'Mid-range', 13000, -4.03, 39.719],
    ['whitesands', 'Sarova Whitesands Beach Resort', 'Bamburi', 'Mombasa', 'resort', 'Upscale', 20000, -3.994, 39.733],
    ['bamburi-beach', 'Bamburi Beach Hotel', 'Bamburi', 'Mombasa', 'resort', 'Mid-range', 11000, -3.999, 39.731],
    ['serena-beach', 'Serena Beach Resort & Spa', 'Shanzu', 'Mombasa', 'resort', 'Luxury', 26000, -3.958, 39.744],
    ['prideinn-paradise', 'PrideInn Paradise Beach Resort', 'Shanzu', 'Mombasa', 'resort', 'Upscale', 18000, -3.962, 39.743],
    ['leopard-beach', 'Leopard Beach Resort & Spa', 'Diani', 'Kwale', 'resort', 'Luxury', 30000, -4.296, 39.588],
    ['swahili-beach', 'Swahili Beach Resort', 'Diani', 'Kwale', 'resort', 'Luxury', 28000, -4.268, 39.599],
    ['diani-reef', 'Diani Reef Beach Resort & Spa', 'Diani', 'Kwale', 'resort', 'Upscale', 22000, -4.285, 39.593],
    ['baobab-beach', 'Baobab Beach Resort & Spa', 'Diani', 'Kwale', 'resort', 'Upscale', 20000, -4.327, 39.577],
    ['medina-palms', 'Medina Palms', 'Watamu', 'Kilifi', 'resort', 'Luxury', 32000, -3.353, 40.028],
    ['hemingways-watamu', 'Hemingways Watamu', 'Watamu', 'Kilifi', 'resort', 'Luxury', 30000, -3.364, 40.021],
    ['turtle-bay', 'Turtle Bay Beach Club', 'Watamu', 'Kilifi', 'resort', 'Mid-range', 16000, -3.359, 40.024],
    ['ocean-beach-malindi', 'Ocean Beach Resort & Spa', 'Malindi', 'Kilifi', 'resort', 'Upscale', 15000, -3.242, 40.131],
    ['peponi', 'Peponi Hotel', 'Shela', 'Lamu', 'hotel', 'Luxury', 30000, -2.297, 40.915],
  ]),
  ...rows('Western & Nyanza', [
    ['acacia-premier', 'Acacia Premier Hotel', 'CBD', 'Kisumu', 'hotel', 'Upscale', 14000, -0.101, 34.759],
    ['sovereign', 'Sovereign Hotel', 'Milimani', 'Kisumu', 'hotel', 'Mid-range', 9000, -0.091, 34.768],
    ['imperial-kisumu', 'Imperial Hotel', 'Jomo Kenyatta Highway', 'Kisumu', 'hotel', 'Mid-range', 9000, -0.1025, 34.757],
    ['kiboko-bay', 'Kiboko Bay Resort', 'Dunga', 'Kisumu', 'resort', 'Mid-range', 12000, -0.103, 34.74],
    ['ciala', 'Ciala Resort', 'Kisumu–Kakamega Road', 'Kisumu', 'resort', 'Mid-range', 10000, -0.072, 34.766],
    ['golf-kakamega', 'Golf Hotel Kakamega', 'Town Centre', 'Kakamega', 'hotel', 'Mid-range', 8000, 0.283, 34.755],
    ['rondo', 'Rondo Retreat', 'Kakamega Forest', 'Kakamega', 'lodge', 'Upscale', 22000, 0.354, 34.865],
  ]),
  ...rows('Rift Valley', [
    ['merica', 'Merica Hotel', 'Town Centre', 'Nakuru', 'hotel', 'Mid-range', 10000, -0.2873, 36.0681],
    ['waterbuck', 'Waterbuck Hotel', 'Town Centre', 'Nakuru', 'hotel', 'Budget', 6000, -0.2853, 36.0656],
    ['woodlands', 'Sarova Woodlands Hotel', 'Milimani', 'Nakuru', 'hotel', 'Upscale', 14000, -0.292, 36.076],
    ['lion-hill', 'Sarova Lion Hill Game Lodge', 'Lake Nakuru NP', 'Nakuru', 'lodge', 'Upscale', 32000, -0.358, 36.099],
    ['nakuru-lodge', 'Lake Nakuru Lodge', 'Lake Nakuru NP', 'Nakuru', 'lodge', 'Upscale', 28000, -0.405, 36.095],
    ['enashipai', 'Enashipai Resort & Spa', 'Lake Naivasha', 'Naivasha', 'resort', 'Luxury', 28000, -0.747, 36.426],
    ['naivasha-sopa', 'Lake Naivasha Sopa Resort', 'Lake Naivasha', 'Naivasha', 'resort', 'Upscale', 22000, -0.796, 36.382],
    ['great-rift', 'Great Rift Valley Lodge & Golf Resort', 'Lake Naivasha', 'Naivasha', 'lodge', 'Upscale', 24000, -0.815, 36.352],
    ['elementaita-serena', 'Lake Elementaita Serena Camp', 'Lake Elementaita', 'Gilgil', 'camp', 'Luxury', 40000, -0.43, 36.24],
    ['boma-inn-eldoret', 'Boma Inn Eldoret', 'Elgon View', 'Eldoret', 'hotel', 'Mid-range', 10000, 0.511, 35.286],
    ['eka-eldoret', 'Eka Hotel Eldoret', 'Eldoret East', 'Eldoret', 'hotel', 'Mid-range', 9000, 0.524, 35.289],
    ['sirikwa', 'Sirikwa Hotel', 'Town Centre', 'Eldoret', 'hotel', 'Budget', 6000, 0.5195, 35.269],
    ['kerio-view', 'Kerio View Hotel', 'Iten', 'Elgeyo-Marakwet', 'hotel', 'Mid-range', 9000, 0.676, 35.511],
    ['tea-hotel', 'Tea Hotel', 'Town Centre', 'Kericho', 'hotel', 'Mid-range', 8000, -0.372, 35.283],
  ]),
  ...rows('Mount Kenya & Central', [
    ['mount-kenya-club', 'Fairmont Mount Kenya Safari Club', 'Nanyuki', 'Laikipia', 'lodge', 'Luxury', 40000, -0.012, 37.122],
    ['sweetwaters', 'Sweetwaters Serena Camp', 'Ol Pejeta', 'Laikipia', 'camp', 'Upscale', 35000, 0.005, 36.911],
    ['outspan', 'Outspan Hotel', 'Nyeri', 'Nyeri', 'hotel', 'Mid-range', 12000, -0.4245, 36.948],
    ['blue-post', 'Blue Post Hotel', 'Chania Falls', 'Thika', 'hotel', 'Mid-range', 9000, -1.038, 37.089],
  ]),
  ...rows('Safari Parks', [
    ['mara-serena', 'Mara Serena Safari Lodge', 'Maasai Mara', 'Narok', 'lodge', 'Luxury', 55000, -1.462, 35.009],
    ['keekorok', 'Keekorok Lodge', 'Maasai Mara', 'Narok', 'lodge', 'Upscale', 40000, -1.588, 35.258],
    ['mara-game-camp', 'Sarova Mara Game Camp', 'Maasai Mara', 'Narok', 'camp', 'Upscale', 45000, -1.438, 35.256],
    ['ol-tukai', 'Ol Tukai Lodge', 'Amboseli', 'Kajiado', 'lodge', 'Upscale', 38000, -2.673, 37.262],
    ['amboseli-serena', 'Amboseli Serena Safari Lodge', 'Amboseli', 'Kajiado', 'lodge', 'Upscale', 40000, -2.687, 37.304],
    ['kilaguni', 'Kilaguni Serena Safari Lodge', 'Tsavo West', 'Taita-Taveta', 'lodge', 'Upscale', 35000, -2.905, 38.069],
    ['voi-lodge', 'Voi Wildlife Lodge', 'Tsavo East', 'Voi', 'lodge', 'Mid-range', 20000, -3.385, 38.581],
    ['shaba', 'Sarova Shaba Game Lodge', 'Shaba Reserve', 'Isiolo', 'lodge', 'Upscale', 35000, 0.665, 37.795],
  ]),
];

/** Hotels near a point, nearest first. Always returns at least `min`. */
export function hotelsNear(point: LatLng, radiusKm = 20, min = 4) {
  const sorted = HOTELS.map((hotel) => ({
    hotel,
    km: distanceKm(point, hotel.coordinate),
  })).sort((a, b) => a.km - b.km);
  const within = sorted.filter((entry) => entry.km <= radiusKm);
  return within.length >= min ? within : sorted.slice(0, min);
}

export function hotelsByRegion() {
  return REGIONS.map((region) => ({
    region,
    hotels: HOTELS.filter((hotel) => hotel.region === region).sort(
      (a, b) => a.town.localeCompare(b.town) || a.name.localeCompare(b.name)
    ),
  }));
}

export function describeHotel(hotel: IHotel) {
  return `${hotel.class} ${HOTEL_KINDS[hotel.kind].label.toLowerCase()}`;
}

export type TMealPlan =
  'Room only' | 'Bed & breakfast' | 'Half board' | 'Full board';

export interface IRoomType {
  id: string;
  name: string;
  detail: string;
  mealPlan: TMealPlan;
  /** Indicative rate in KES per room per night. */
  nightly: number;
}

function roundRate(amount: number) {
  return Math.round(amount / 500) * 500;
}

/** Room types and nightly rates, scaled from the hotel's entry rate. */
export function roomsFor(hotel: IHotel): IRoomType[] {
  const rate = (factor: number) => roundRate(hotel.from * factor);
  switch (hotel.kind) {
    case 'resort':
      return [
        {
          id: 'standard',
          name: 'Standard Room',
          detail: 'Garden view, sleeps 2',
          mealPlan: 'Half board',
          nightly: hotel.from,
        },
        {
          id: 'sea-view',
          name: 'Sea View Room',
          detail: 'Ocean-facing balcony, sleeps 2',
          mealPlan: 'Half board',
          nightly: rate(1.35),
        },
        {
          id: 'suite',
          name: 'Beach Suite',
          detail: 'Lounge and terrace, sleeps 3',
          mealPlan: 'Half board',
          nightly: rate(2),
        },
      ];
    case 'lodge':
    case 'camp':
      return [
        {
          id: 'standard',
          name: hotel.kind === 'camp' ? 'Safari Tent' : 'Standard Room',
          detail: 'Sleeps 2',
          mealPlan: 'Full board',
          nightly: hotel.from,
        },
        {
          id: 'family',
          name: 'Family Room',
          detail: 'Sleeps 4, two bedrooms',
          mealPlan: 'Full board',
          nightly: rate(1.7),
        },
      ];
    default:
      return [
        {
          id: 'standard',
          name: 'Standard Room',
          detail: 'Queen bed, sleeps 2',
          mealPlan: 'Bed & breakfast',
          nightly: hotel.from,
        },
        {
          id: 'deluxe',
          name: 'Deluxe Room',
          detail: 'King bed and city view',
          mealPlan: 'Bed & breakfast',
          nightly: rate(1.4),
        },
        {
          id: 'suite',
          name: 'Executive Suite',
          detail: 'Separate lounge, lounge access',
          mealPlan: 'Bed & breakfast',
          nightly: rate(2.2),
        },
      ];
  }
}
