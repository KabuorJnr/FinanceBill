import type { TTrayAnimationPreset, TTraySpringTable } from '../types';

const TRAY_ANIMATION_PRESETS = [
  'default',
  'smooth',
  'snappy',
  'bouncy',
] as const;

const TRAY_ANIMATION_KINDS = [
  'present',
  'dismiss',
  'morph',
  'layout',
  'content',
  'drag',
] as const;

const CONTENT_DAMPING_FRACTION = 0.7;

const ANIMATION_PRESET_TABLES: Record<
  Exclude<TTrayAnimationPreset, 'default'>,
  TTraySpringTable
> = {
  smooth: {
    present: [0.5, 1],
    dismiss: [0.4, 1],
    morph: [0.55, 1],
    layout: [0.45, 1],
    content: [0.4, 1],
    drag: [0.35, 1],
  },
  snappy: {
    present: [0.3, 0.85],
    dismiss: [0.28, 1],
    morph: [0.38, 0.9],
    layout: [0.3, 0.9],
    content: [0.22, 0.85],
    drag: [0.25, 0.8],
  },
  bouncy: {
    present: [0.45, 0.62],
    dismiss: [0.35, 0.9],
    morph: [0.55, 0.68],
    layout: [0.4, 0.65],
    content: [0.32, 0.6],
    drag: [0.35, 0.55],
  },
};

export {
  TRAY_ANIMATION_PRESETS,
  TRAY_ANIMATION_KINDS,
  CONTENT_DAMPING_FRACTION,
  ANIMATION_PRESET_TABLES,
};
