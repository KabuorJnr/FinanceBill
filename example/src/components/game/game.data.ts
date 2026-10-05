import type { SFSymbol } from 'expo-symbols';

const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;

export interface IGameTag {
  label: string;
  icon: SFSymbol;
}

export interface IGameShot {
  id: string;
  title: string;
  caption: string;
  uri: string;
}

export interface IGameReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
}

export interface IGameSave {
  id: string;
  chapter: string;
  place: string;
  hours: number;
}

export interface IGame {
  title: string;
  description: string;
  hero: string;
  avatar: string;
  tags: IGameTag[];
  plays: number;
  likes: number;
  rating: number;
  ratingBreakdown: number[];
  reviewCount: number;
  creator: string;
  released: string;
  size: string;
  gallery: IGameShot[];
  reviews: IGameReview[];
  saves: IGameSave[];
}

export const BLADEBOUND: IGame = {
  title: 'Bladebound',
  description:
    'Enter a forgotten kingdom, master your blade, and uncover its ancient secrets.',
  hero: unsplash('1731937817165-1fed94fc03b2', 1200),
  avatar: unsplash('1773216344170-7fca0c1f83ea', 360),
  tags: [
    { label: 'Action', icon: 'figure.fencing' },
    { label: 'Fantasy', icon: 'wand.and.stars' },
  ],
  plays: 512_000,
  likes: 5_480,
  rating: 4.3,
  ratingBreakdown: [0.58, 0.24, 0.1, 0.05, 0.03],
  reviewCount: 1_284,
  creator: 'Ember Forge',
  released: 'Mar 2026',
  size: '1.2 GB',
  gallery: [
    {
      id: 'valley',
      title: 'The Sundered Vale',
      caption: 'Where the old road ends and the first trial begins.',
      uri: unsplash('1763198216883-7473e2c7eabb', 900),
    },
    {
      id: 'grove',
      title: 'Lanternroot Grove',
      caption: 'Follow the river of light to the heart of the forest.',
      uri: unsplash('1729693164076-aa8a190d52ce', 900),
    },
    {
      id: 'gate',
      title: 'The Moss Gate',
      caption: 'Sealed for a thousand years. Only the bound blade opens it.',
      uri: unsplash('1548445929-4f60a497f851', 900),
    },
    {
      id: 'chalice',
      title: 'Chalice of Titans',
      caption: 'The final ascent, above the clouds of the old world.',
      uri: unsplash('1786099117465-fe1e5757a7fa', 900),
    },
  ],
  reviews: [
    {
      id: 'gadgetboy',
      author: 'Gadgetboy',
      avatar: 'https://i.pravatar.cc/120?img=12',
      rating: 4,
      date: '2d ago',
      text: 'The sword feels incredible. Every parry lands with a satisfying clang, and the forest levels are gorgeous.',
    },
    {
      id: 'mira',
      author: 'Mira K.',
      avatar: 'https://i.pravatar.cc/120?img=47',
      rating: 5,
      date: '5d ago',
      text: 'Beat the Moss Gate boss after an hour of tries. Worth every death. The soundtrack is unreal.',
    },
    {
      id: 'theo',
      author: 'Theo Park',
      avatar: 'https://i.pravatar.cc/120?img=33',
      rating: 4,
      date: '1w ago',
      text: 'Great pacing and secrets everywhere. Wish the map was a little clearer in the later chapters.',
    },
    {
      id: 'juno',
      author: 'Juno',
      avatar: 'https://i.pravatar.cc/120?img=5',
      rating: 5,
      date: '1w ago',
      text: 'Remixed it into a speedrun mode with friends. Easily the best game on here this month.',
    },
    {
      id: 'ravi',
      author: 'Ravi S.',
      avatar: 'https://i.pravatar.cc/120?img=59',
      rating: 3,
      date: '2w ago',
      text: 'Lovely art, but the difficulty spike in chapter four is rough. Story mode helps.',
    },
    {
      id: 'lena',
      author: 'Lena',
      avatar: 'https://i.pravatar.cc/120?img=44',
      rating: 5,
      date: '3w ago',
      text: 'The rain in the opening grove with the sword in the stone. Instant chills.',
    },
  ],
  saves: [
    {
      id: 'slot-1',
      chapter: 'Chapter 3 · The Moss Gate',
      place: 'Lanternroot Grove',
      hours: 12,
    },
    {
      id: 'slot-2',
      chapter: 'Chapter 1 · Awakening',
      place: 'The Sundered Vale',
      hours: 2,
    },
  ],
};
