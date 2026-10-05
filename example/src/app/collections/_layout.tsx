import { BlankStack } from 'react-native-screen-transitions/expo-router';

import {
  CollectionsProvider,
  collectionsTransition,
} from '../../components/collections';

export default function CollectionsLayout() {
  return (
    <CollectionsProvider>
      <BlankStack>
        <BlankStack.Screen name="index" />
        <BlankStack.Screen name="all" options={collectionsTransition} />
      </BlankStack>
    </CollectionsProvider>
  );
}
