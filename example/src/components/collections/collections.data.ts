export interface ICollection {
  id: string;
  name: string;
  date: Date;
  memories: number;
  tint: string;
  photos: string[];
  members: string[];
  extraMembers: number;
}

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?w=600&q=80&auto=format&fit=crop`;

const avatar = (index: number) => `https://i.pravatar.cc/120?img=${index}`;

export const ME_AVATAR = avatar(47);

export const EMPTY_STATE_PHOTOS = {
  left: photo('photo-1522383225653-ed111181a951'),
  right: photo('photo-1490806843957-31f4c9a91c65'),
  front: photo('photo-1501785888041-af3ef285b470'),
} as const;

export const SEED_COLLECTIONS: ICollection[] = [
  {
    id: 'japan',
    name: 'Japan group trip',
    date: new Date(2026, 0, 2),
    memories: 50,
    tint: '#F28B95',
    photos: [
      photo('photo-1493976040374-85c8e12f0c0e'),
      photo('photo-1478436127897-769e1b3f0f36'),
      photo('photo-1528164344705-47542687000d'),
      photo('photo-1545569341-9eb8b30979d9'),
    ],
    members: [avatar(47), avatar(45), avatar(32)],
    extraMembers: 4,
  },
  {
    id: 'detty-december',
    name: 'Detty December 1',
    date: new Date(2025, 11, 20),
    memories: 102,
    tint: '#8E9BF5',
    photos: [
      photo('photo-1470225620780-dba8ba36b745'),
      photo('photo-1514525253161-7a46d19cd819'),
      photo('photo-1429962714451-bb934ecdc4ec'),
      photo('photo-1492684223066-81342ee5ff30'),
    ],
    members: [avatar(44), avatar(12), avatar(59)],
    extraMembers: 16,
  },
];
