import {
  ANIMATION_PRESET_TABLES,
  CONTENT_DAMPING_FRACTION,
} from '../constants';
import type {
  IPhysicalSpring,
  IResolvedTrayAnimation,
  ITrayAnimation,
} from '../interfaces';
import type {
  TSpringResponse,
  TTrayAnimationPreset,
  TTraySpring,
  TTraySpringTable,
} from '../types';

const defaultSpringTable = (duration: number): TTraySpringTable => ({
  present: [0.4, 0.75],
  dismiss: [0.35, 1],
  morph: [0.5, 0.86],
  layout: [duration * 1.2, 0.8],
  content: [duration, CONTENT_DAMPING_FRACTION],
  drag: [0.3, 0.7],
});

const springTable = (
  preset: TTrayAnimationPreset,
  duration: number
): TTraySpringTable =>
  preset === 'default'
    ? defaultSpringTable(duration)
    : ANIMATION_PRESET_TABLES[preset];

const springFromResponse = (
  response: number,
  dampingFraction: number
): IPhysicalSpring => {
  const r = Math.max(response, 0.01);
  return {
    mass: 1,
    stiffness: Math.pow((2 * Math.PI) / r, 2),
    damping: (4 * Math.PI * dampingFraction) / r,
  };
};

const resolveSpring = (
  spring: TTraySpring | undefined,
  fallback: TSpringResponse
): IPhysicalSpring => {
  if (!spring) {
    return springFromResponse(fallback[0], fallback[1]);
  }

  if ('stiffness' in spring && spring.stiffness !== undefined) {
    const mass = spring.mass ?? 1;
    const damping =
      spring.damping ?? 2 * 0.8 * Math.sqrt(spring.stiffness * mass);
    return { mass, stiffness: spring.stiffness, damping };
  }

  const swiftUI = spring as { response?: number; dampingFraction?: number };
  return springFromResponse(
    swiftUI.response ?? fallback[0],
    swiftUI.dampingFraction ?? fallback[1]
  );
};

const resolveAnimation = (
  animation: TTrayAnimationPreset | ITrayAnimation | undefined,
  duration: number
): IResolvedTrayAnimation => {
  const config: ITrayAnimation =
    typeof animation === 'string' ? { preset: animation } : (animation ?? {});
  const table = springTable(config.preset ?? 'default', duration);

  return {
    present: resolveSpring(config.present, table.present),
    dismiss: resolveSpring(config.dismiss, table.dismiss),
    morph: resolveSpring(config.morph, table.morph),
    layout: resolveSpring(config.layout, table.layout),
    content: resolveSpring(config.content, table.content),
    drag: resolveSpring(config.drag, table.drag),
  };
};

const resolveContentSpring = (
  spring: TTraySpring | undefined,
  duration: number | undefined,
  rootSprings: IResolvedTrayAnimation | undefined,
  rootDuration: number
): IPhysicalSpring => {
  if (spring) {
    return resolveSpring(spring, [
      duration ?? rootDuration,
      CONTENT_DAMPING_FRACTION,
    ]);
  }
  if (duration !== undefined) {
    return springFromResponse(duration, CONTENT_DAMPING_FRACTION);
  }
  return (
    rootSprings?.content ??
    springFromResponse(rootDuration, CONTENT_DAMPING_FRACTION)
  );
};

export {
  springFromResponse,
  resolveSpring,
  resolveAnimation,
  resolveContentSpring,
};
