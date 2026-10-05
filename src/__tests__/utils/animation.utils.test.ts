import { describe, expect, it } from '@jest/globals';

import { ANIMATION_PRESET_TABLES } from '../../constants';
import {
  resolveAnimation,
  resolveContentSpring,
  resolveSpring,
  springFromResponse,
} from '../../utils';

describe('springFromResponse', () => {
  it('converts SwiftUI response and damping fraction to a physical spring', () => {
    const spring = springFromResponse(0.5, 0.8);

    expect(spring.mass).toBe(1);
    expect(spring.stiffness).toBeCloseTo(Math.pow((2 * Math.PI) / 0.5, 2));
    expect(spring.damping).toBeCloseTo((4 * Math.PI * 0.8) / 0.5);
  });

  it('is critically damped at a damping fraction of 1', () => {
    const spring = springFromResponse(0.4, 1);

    expect(spring.damping).toBeCloseTo(
      2 * Math.sqrt(spring.stiffness * spring.mass)
    );
  });

  it('clamps very small responses', () => {
    expect(Number.isFinite(springFromResponse(0, 1).stiffness)).toBe(true);
  });
});

describe('resolveSpring', () => {
  it('uses the fallback when no spring is given', () => {
    expect(resolveSpring(undefined, [0.3, 0.7])).toEqual(
      springFromResponse(0.3, 0.7)
    );
  });

  it('fills missing SwiftUI fields from the fallback', () => {
    expect(resolveSpring({ response: 0.6 }, [0.3, 0.7])).toEqual(
      springFromResponse(0.6, 0.7)
    );
    expect(resolveSpring({ dampingFraction: 1 }, [0.3, 0.7])).toEqual(
      springFromResponse(0.3, 1)
    );
  });

  it('passes physical springs through', () => {
    expect(
      resolveSpring({ stiffness: 300, damping: 20, mass: 2 }, [0.3, 0.7])
    ).toEqual({
      stiffness: 300,
      damping: 20,
      mass: 2,
    });
  });

  it('defaults a physical spring to unit mass and gentle damping', () => {
    const spring = resolveSpring({ stiffness: 400 }, [0.3, 0.7]);

    expect(spring.mass).toBe(1);
    expect(spring.damping).toBeCloseTo(2 * 0.8 * Math.sqrt(400));
  });
});

describe('resolveAnimation', () => {
  it('derives content and layout springs from the duration by default', () => {
    const animation = resolveAnimation(undefined, 0.5);

    expect(animation.content).toEqual(springFromResponse(0.5, 0.7));
    expect(animation.layout).toEqual(springFromResponse(0.6, 0.8));
  });

  it('accepts a preset name', () => {
    const [response, dampingFraction] = ANIMATION_PRESET_TABLES.bouncy.morph;

    expect(resolveAnimation('bouncy', 0.25).morph).toEqual(
      springFromResponse(response, dampingFraction)
    );
  });

  it('overrides a single animation on top of a preset', () => {
    const animation = resolveAnimation(
      { preset: 'smooth', drag: { stiffness: 500, damping: 30 } },
      0.25
    );
    const [response, dampingFraction] = ANIMATION_PRESET_TABLES.smooth.present;

    expect(animation.drag).toEqual({ stiffness: 500, damping: 30, mass: 1 });
    expect(animation.present).toEqual(
      springFromResponse(response, dampingFraction)
    );
  });

  it('does not depend on the duration once a preset is chosen', () => {
    expect(resolveAnimation('snappy', 0.25)).toEqual(
      resolveAnimation('snappy', 2)
    );
  });
});

describe('resolveContentSpring', () => {
  const rootSprings = resolveAnimation('smooth', 0.25);

  it('prefers an explicit spring', () => {
    expect(
      resolveContentSpring({ response: 0.9 }, undefined, rootSprings, 0.25)
    ).toEqual(springFromResponse(0.9, 0.7));
  });

  it('then an explicit duration', () => {
    expect(resolveContentSpring(undefined, 0.4, rootSprings, 0.25)).toEqual(
      springFromResponse(0.4, 0.7)
    );
  });

  it('then the root content spring', () => {
    expect(resolveContentSpring(undefined, undefined, rootSprings, 0.25)).toBe(
      rootSprings.content
    );
  });

  it('falls back to the root duration outside a tray', () => {
    expect(resolveContentSpring(undefined, undefined, undefined, 0.3)).toEqual(
      springFromResponse(0.3, 0.7)
    );
  });
});
