import Transition from 'react-native-screen-transitions';
import type { BlankStackNavigationOptions } from 'react-native-screen-transitions/expo-router';

import { collectionColors } from './collections.theme';

export const COLLECTIONS_HERO_ID = 'collections-hero';

export const collectionsTransition: BlankStackNavigationOptions = {
  gestureEnabled: true,
  gestureDirection: ['horizontal', 'vertical'],
  transitionSpec: Transition.Specs.Zoom,
  screenStyleInterpolator: ({ bounds }) => {
    'worklet';

    return bounds(COLLECTIONS_HERO_ID).navigation.zoom({
      target: 'bound',
      borderRadius: 48,
      backgroundScale: 0.94,
      backdropColor: collectionColors.text,
      backdropOpacity: 0.18,
    });
  },
};
