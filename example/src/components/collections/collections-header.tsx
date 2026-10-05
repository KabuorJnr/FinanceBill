import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { ME_AVATAR } from './collections.data';
import { collectionColors, collectionLayout } from './collections.theme';
import { GlassIconButton } from './glass-surface';

const AVATAR_SIZE = collectionLayout.buttonSize;

interface ICollectionsHeaderProps {
  onSearchPress?: () => void;
  onFilterPress?: () => void;
}

export function CollectionsHeader({
  onSearchPress,
  onFilterPress,
}: ICollectionsHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.avatarRing}>
        <Image
          source={{ uri: ME_AVATAR }}
          transition={200}
          style={styles.avatar}
          accessibilityLabel="Your profile"
        />
      </View>
      <View style={styles.actions}>
        <GlassIconButton
          icon={{ ios: 'magnifyingglass', android: 'search' }}
          label="Search"
          onPress={onSearchPress}
        />
        <GlassIconButton
          icon={{ ios: 'line.3.horizontal.decrease', android: 'filter_list' }}
          label="Filter"
          onPress={onFilterPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: collectionLayout.gutter,
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    padding: 2,
    backgroundColor: collectionColors.surface,
  },
  avatar: {
    flex: 1,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: collectionColors.fieldPressed,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
});
