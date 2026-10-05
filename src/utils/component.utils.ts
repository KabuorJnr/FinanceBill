import type { ComponentType } from 'react';

const createCompoundComponent = <
  T extends ComponentType<any>,
  TCompound extends Record<string, unknown> = {},
>(
  name: string,
  component: T,
  compound: TCompound = {} as TCompound
): T & TCompound => {
  component.displayName = name satisfies string as string;
  return Object.assign<T, TCompound>(component, compound);
};

export { createCompoundComponent };
