import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  ME_AVATAR,
  SEED_COLLECTIONS,
  type ICollection,
} from './collections.data';

interface ICollectionsStore {
  collections: ICollection[];
  addCollection: (name: string, tint: string) => void;
}

const CollectionsContext = createContext<ICollectionsStore | null>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState(SEED_COLLECTIONS);

  const addCollection = useCallback((name: string, tint: string) => {
    setCollections((current) => [
      {
        id: `collection-${Date.now()}`,
        name,
        date: new Date(),
        memories: 0,
        tint,
        photos: [],
        members: [ME_AVATAR],
        extraMembers: 0,
      },
      ...current,
    ]);
  }, []);

  const value = useMemo(
    () => ({ collections, addCollection }),
    [collections, addCollection]
  );

  return <CollectionsContext value={value}>{children}</CollectionsContext>;
}

export function useCollections(): ICollectionsStore {
  const store = use(CollectionsContext);
  if (!store) {
    throw new Error('useCollections must be used inside <CollectionsProvider>');
  }
  return store;
}
