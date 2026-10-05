import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Transition from 'react-native-screen-transitions';

import { fonts } from '../../constants';
import type { ICollection } from './collections.data';
import {
  collectionColors,
  collectionType,
  formatCollectionDate,
} from './collections.theme';
import { FolderCard } from './folder-card';

const AVATAR_SIZE = 26;
const AVATAR_OVERLAP = 8;

interface ICollectionCardProps {
  collection: ICollection;
  width: number;
  boundaryId?: string;
}

export const CollectionCard = memo(function CollectionCard({
  collection,
  width,
  boundaryId,
}: ICollectionCardProps) {
  const memories = `${collection.memories} ${
    collection.memories === 1 ? 'Memory' : 'Memories'
  }`;

  return (
    <View style={styles.card}>
      <Transition.Boundary
        id={boundaryId ?? collection.id}
        enabled={!!boundaryId}
      >
        <FolderCard
          width={width}
          tint={collection.tint}
          photos={collection.photos}
        />
      </Transition.Boundary>

      <View style={styles.caption}>
        <Text style={collectionType.title} numberOfLines={1}>
          {collection.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={collectionType.meta}>
            {formatCollectionDate(collection.date)}
          </Text>
          <View style={styles.dot} />
          <Text style={collectionType.meta}>{memories}</Text>
        </View>
        <Members avatars={collection.members} extra={collection.extraMembers} />
      </View>
    </View>
  );
});

function Members({ avatars, extra }: { avatars: string[]; extra: number }) {
  return (
    <View style={styles.members}>
      {avatars.map((uri, index) => (
        <Image
          key={uri}
          source={{ uri }}
          transition={200}
          style={[styles.avatar, index > 0 && styles.overlap]}
        />
      ))}
      {extra > 0 && (
        <View style={[styles.avatar, styles.overlap, styles.extra]}>
          <Text style={styles.extraLabel}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 18,
  },
  caption: {
    alignItems: 'center',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: collectionColors.textSecondary,
  },
  members: {
    flexDirection: 'row',
    marginTop: 8,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: collectionColors.surface,
    backgroundColor: collectionColors.fieldPressed,
  },
  overlap: {
    marginLeft: -AVATAR_OVERLAP,
  },
  extra: {
    width: AVATAR_SIZE + 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: collectionColors.surface,
  },
  extraLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: collectionColors.textSecondary,
  },
});
