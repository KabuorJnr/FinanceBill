import { createContext } from 'react';
import type { ITrayContext } from '../interfaces';

const TrayContext = createContext<ITrayContext | null>(null);
const TrayBodyContext = createContext<string | undefined | null>(null);
export { TrayContext, TrayBodyContext };
