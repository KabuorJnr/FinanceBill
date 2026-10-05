import type { ViewProps } from 'react-native';

import type { TTraySpring, TTrayTransition } from '../types';

interface ITrayBodyProps extends ViewProps {
  transition?: TTrayTransition;
  duration?: number;
  spring?: TTraySpring;
}

interface ITrayViewProps extends ViewProps {
  name: string;
  fullScreen?: boolean;
}

interface ITrayMorphProps extends ViewProps {
  value: string | number | boolean;
  transition?: TTrayTransition;
  duration?: number;
  spring?: TTraySpring;
}

export type { ITrayBodyProps, ITrayViewProps, ITrayMorphProps };
