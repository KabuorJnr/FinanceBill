import { useContext } from 'react';

import { TrayContext } from '../context';
import type { ITrayContext } from '../interfaces';

const useTrayContext = <T extends string>(component: T): ITrayContext => {
  const context = useContext<ITrayContext | null>(TrayContext);
  if (!context) {
    throw new Error(`<${component}> must be used within <Tray.Root>.`);
  }
  return context;
};

export { useTrayContext };
