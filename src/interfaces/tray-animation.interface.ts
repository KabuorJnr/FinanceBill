import type { TTrayAnimationPreset, TTraySpring } from '../types';

interface ITrayAnimation {
  preset?: TTrayAnimationPreset;
  present?: TTraySpring;
  dismiss?: TTraySpring;
  morph?: TTraySpring;
  layout?: TTraySpring;
  content?: TTraySpring;
  drag?: TTraySpring;
}

interface IPhysicalSpring {
  mass: number;
  stiffness: number;
  damping: number;
}

interface IResolvedTrayAnimation {
  present: IPhysicalSpring;
  dismiss: IPhysicalSpring;
  morph: IPhysicalSpring;
  layout: IPhysicalSpring;
  content: IPhysicalSpring;
  drag: IPhysicalSpring;
}

export type { ITrayAnimation, IPhysicalSpring, IResolvedTrayAnimation };
