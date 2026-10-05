import { useCallback, useRef, useState } from 'react';

const useControllableState = <T>(
  prop: T | undefined,
  defaultProp: T,
  onChange: ((value: T) => void) | undefined
): [T, (value: T) => void] => {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolled;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  const setValue = useCallback(
    (next: T) => {
      if (Object.is(next, valueRef.current)) {
        return;
      }
      if (!isControlled) {
        setUncontrolled(next);
      }
      onChangeRef.current?.(next);
    },
    [isControlled]
  );

  return [value, setValue];
};

export { useControllableState };
