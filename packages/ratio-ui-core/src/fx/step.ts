// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// One physics for every particle: drag, gravity, spin and the paper flutter,
// then a fade over the last part of its life.

import type { FxOrigin, FxParticle, FxPoint, FxRect } from './types';

/**
 * The longest step taken at once, in seconds. A tab that comes back after a
 * minute moves its particles a frame, not a minute.
 */
export const FX_MAX_STEP = 0.05;

/** The share of its life a steady particle spends fading out. */
const FADE_SHARE = 0.3;

/**
 * The particles after `dt` seconds, without the ones whose life is over.
 * A new array; the input is left alone.
 */
export function stepParticles(particles: readonly FxParticle[], dt: number): FxParticle[] {
  const t = Math.min(Math.max(dt, 0), FX_MAX_STEP);
  const next: FxParticle[] = [];
  for (const p of particles) {
    const age = p.age + t;
    if (age >= p.life) continue;
    const keep = Math.pow(p.drag, t);
    const vx = p.vx * keep;
    const vy = p.vy * keep + p.gravity * t;
    next.push({
      ...p,
      x: p.x + vx * t,
      y: p.y + vy * t,
      vx,
      vy,
      rotation: p.rotation + p.spin * t,
      flip: p.flip + p.flipSpeed * t,
      age,
    });
  }
  return next;
}

/** How opaque a particle is now, 0–1: steady, fading at the end, flickering if it twinkles. */
export function particleOpacity(p: FxParticle): number {
  const progress = p.age / p.life;
  const fade = progress < 1 - FADE_SHARE ? 1 : Math.max(0, (1 - progress) / FADE_SHARE);
  const flicker = p.twinkle > 0 ? 0.55 + 0.45 * Math.cos(2 * Math.PI * p.twinkle * p.age) : 1;
  return Math.min(1, Math.max(0, fade * flicker));
}

/** True when the origin is an element's box rather than a point. */
export const isRect = (origin: FxOrigin): origin is FxRect =>
  'width' in origin && 'height' in origin;

/** The centre of an origin: the point itself, or the middle of the box. */
export function centerOf(origin: FxOrigin): FxPoint {
  return isRect(origin)
    ? { x: origin.x + origin.width / 2, y: origin.y + origin.height / 2 }
    : { x: origin.x, y: origin.y };
}
