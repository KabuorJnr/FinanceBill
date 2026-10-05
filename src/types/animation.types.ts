import type {
  TRAY_ANIMATION_KINDS,
  TRAY_ANIMATION_PRESETS,
} from '../constants';

type TTrayAnimationPreset = (typeof TRAY_ANIMATION_PRESETS)[number];

type TTrayAnimationKind = (typeof TRAY_ANIMATION_KINDS)[number];

type TTraySpring =
  | { response?: number; dampingFraction?: number }
  | { stiffness: number; damping?: number; mass?: number };

type TSpringResponse = readonly [response: number, dampingFraction: number];

type TTraySpringTable = Record<TTrayAnimationKind, TSpringResponse>;

export type {
  TTrayAnimationPreset,
  TTrayAnimationKind,
  TTraySpring,
  TSpringResponse,
  TTraySpringTable,
};
