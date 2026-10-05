const TRAY_TRANSITIONS = ['morph', 'slide', 'fade', 'scale'] as const;
const TRAY_DIRECTIONS = ['forward', 'backward'] as const;
const TRAY_DEFAULTS = {
  DURATION: 0.25,
  TRANSITION: 'morph',
  CORNER_RADIUS: 32,
  CORNER_SMOOTHING: 0.6,
  HORIZONTAL_INSET: 16,
  BOTTOM_OFFSET: 16,
  TOP_INSET: 12,
  MAX_WIDTH: 480,
  BACKDROP_OPACITY: 0.3,
} as const;
const FALLBACK_TOP_INSET = 50;
const NO_ORIGIN_TAG = -1;

export {
  TRAY_TRANSITIONS,
  TRAY_DIRECTIONS,
  TRAY_DEFAULTS,
  FALLBACK_TOP_INSET,
  NO_ORIGIN_TAG,
};
