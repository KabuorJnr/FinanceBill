import { describe, expect, it, jest } from '@jest/globals';
import type { GestureResponderEvent } from 'react-native';

import {
  assignRef,
  composePress,
  stopResponderNegotiation,
  stopTouchPropagation,
} from '../../utils';

const pressEvent = (overrides: Partial<GestureResponderEvent> = {}) =>
  ({
    defaultPrevented: false,
    stopPropagation: jest.fn(),
    ...overrides,
  }) as unknown as GestureResponderEvent;

describe('composePress', () => {
  it('runs the user handler before the tray action', () => {
    const calls: string[] = [];
    const press = composePress(
      () => calls.push('theirs'),
      () => calls.push('ours')
    );

    press(pressEvent());

    expect(calls).toEqual(['theirs', 'ours']);
  });

  it('skips the tray action when the default is prevented', () => {
    const ours = jest.fn();
    const press = composePress(undefined, ours);

    press(pressEvent({ defaultPrevented: true }));

    expect(ours).not.toHaveBeenCalled();
  });

  it('works without a user handler', () => {
    const ours = jest.fn();

    composePress(null, ours)(pressEvent());

    expect(ours).toHaveBeenCalledTimes(1);
  });
});

describe('assignRef', () => {
  it('calls callback refs', () => {
    const ref = jest.fn<(value: string) => void>();

    assignRef(ref, 'value');

    expect(ref).toHaveBeenCalledWith('value');
  });

  it('sets object refs', () => {
    const ref = { current: null as string | null };

    assignRef(ref, 'value');

    expect(ref.current).toBe('value');
  });

  it('ignores missing refs', () => {
    expect(() => assignRef(undefined, 'value')).not.toThrow();
  });
});

describe('touch propagation', () => {
  it('stops touches from reaching ancestors', () => {
    const event = pressEvent();

    stopTouchPropagation(event);

    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('stops negotiation without claiming the responder', () => {
    const event = pressEvent();

    expect(stopResponderNegotiation(event)).toBe(false);
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
