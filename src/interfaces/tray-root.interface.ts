import type { ReactNode } from 'react';

import type { TTrayAnimationPreset, TTrayTransition } from '../types';
import type { ITrayAnimation } from './tray-animation.interface';

interface ITrayRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  view?: string;
  defaultView?: string;
  onViewChange?: (view: string) => void;
  resetOnClose?: boolean;
  transition?: TTrayTransition;
  duration?: number;
  animation?: TTrayAnimationPreset | ITrayAnimation;
}

export type { ITrayRootProps };
