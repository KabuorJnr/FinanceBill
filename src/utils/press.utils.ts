import type { Ref } from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { TPressHandler } from '../types';

const composePress =
  (theirs: TPressHandler, ours: (event: GestureResponderEvent) => void) =>
  (event: GestureResponderEvent): void => {
    theirs?.(event);
    if (!event?.defaultPrevented) {
      ours(event);
    }
  };

const assignRef = <T>(ref: Ref<T> | undefined, value: T): void => {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    (ref as { current: T }).current = value;
  }
};

const stopTouchPropagation = <T extends GestureResponderEvent>(
  event: T
): void => event.stopPropagation();

const stopResponderNegotiation = <T extends GestureResponderEvent>(
  event: T
): boolean => {
  event.stopPropagation();
  return false;
};

export {
  composePress,
  assignRef,
  stopTouchPropagation,
  stopResponderNegotiation,
};
