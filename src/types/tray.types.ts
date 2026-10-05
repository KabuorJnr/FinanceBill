import type { GestureResponderEvent, findNodeHandle } from 'react-native';

import type {
  COMPONENT_NAMES,
  NATIVE_VIEW_NAMES,
  TRAY_DIRECTIONS,
  TRAY_TRANSITIONS,
} from '../constants';

type TTrayTransition = (typeof TRAY_TRANSITIONS)[number];

type TTrayDirection = (typeof TRAY_DIRECTIONS)[number];

type TNativeViewName =
  (typeof NATIVE_VIEW_NAMES)[keyof typeof NATIVE_VIEW_NAMES];

type TComponentName = (typeof COMPONENT_NAMES)[keyof typeof COMPONENT_NAMES];

type TPressHandler =
  ((event: GestureResponderEvent) => void) | null | undefined;

type THostRef = Parameters<typeof findNodeHandle>[0];

export type {
  TTrayTransition,
  TTrayDirection,
  TNativeViewName,
  TComponentName,
  TPressHandler,
  THostRef,
};
