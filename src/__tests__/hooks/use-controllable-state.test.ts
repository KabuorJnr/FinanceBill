import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { useControllableState } from '../../hooks';

describe('useControllableState', () => {
  it('keeps its own state when uncontrolled', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableState<boolean>(undefined, false, onChange)
    );

    act(() => result.current[1](true));

    expect(result.current[0]).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('only reports changes when controlled', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableState<boolean>(false, false, onChange)
    );

    act(() => result.current[1](true));

    expect(result.current[0]).toBe(false);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('ignores setting the current value', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useControllableState<boolean>(undefined, true, onChange)
    );

    act(() => result.current[1](true));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('follows the controlled prop', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useControllableState<string>(value, 'a', undefined),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });

    expect(result.current[0]).toBe('b');
  });
});
