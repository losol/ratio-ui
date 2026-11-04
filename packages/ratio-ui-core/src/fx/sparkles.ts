// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Sparkles: a ring of small stars around the element that earned them,
// drifting outward and twinkling out. The quiet one, for small wins. Round
// an element they start on its box grown by `inset`, so none lands on its
// content, however large or wide it is; round a bare point, on a circle.

import { resolveFxColors, type FxColors } from './colors';
import { centerOf, isRect } from './step';
import type { FxBurst, FxOrigin, FxParticle, FxPoint } from './types';

export interface SparklesOptions {
  /** How many stars. Capped at the effect's budget. @default 18 */
  count: number;
  /** How far outside the element's box they start, px. @default 12 */
  inset: number;
  /** Size multiplier for every star. @default 1 */
  scale: number;
  colors: FxColors;
}

const DEFAULTS: Omit<SparklesOptions, 'colors'> = { count: 18, inset: 12, scale: 1 };

/** Around a bare point, the stars start on a circle this far out, before `inset`. */
const POINT_RADIUS = 24;

/** The most stars one ring may hold. */
const BUDGET = 60;

/**
 * The point a share `u` (0–1) of the way round, clockwise from the top-left
 * corner: on the element's box grown by `inset`, or on a circle round a point.
 */
function ringPoint(origin: FxOrigin, inset: number, u: number): FxPoint {
  const c = centerOf(origin);
  if (!isRect(origin)) {
    const a = u * 2 * Math.PI;
    const r = POINT_RADIUS + inset;
    return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r };
  }
  const left = origin.x - inset;
  const top = origin.y - inset;
  const w = origin.width + 2 * inset;
  const h = origin.height + 2 * inset;
  let d = (((u % 1) + 1) % 1) * 2 * (w + h);
  if (d < w) return { x: left + d, y: top };
  d -= w;
  if (d < h) return { x: left + w, y: top + d };
  d -= h;
  if (d < w) return { x: left + w - d, y: top + h };
  d -= w;
  return { x: left, y: top + h - d };
}

/** Sparkles around an element. `play(sparkles, …)` on the web. */
export const sparkles: FxBurst<SparklesOptions> = Object.freeze<FxBurst<SparklesOptions>>({
  name: 'sparkles',
  kind: 'burst',
  budget: BUDGET,
  spawn(origin, options, random) {
    const o = { ...DEFAULTS, ...options };
    const colors = resolveFxColors(options.colors);
    const count = Math.max(0, Math.min(Math.round(o.count), BUDGET));
    const inset = Math.max(0, o.inset);
    const c = centerOf(origin);
    const particles: FxParticle[] = [];
    for (let i = 0; i < count; i++) {
      // Evenly round the ring, nudged so it does not look stamped.
      const at = ringPoint(origin, inset, (i + random.range(-0.35, 0.35)) / Math.max(count, 1));
      // Away from the centre: outward on every side and at the corners.
      const dx = at.x - c.x;
      const dy = at.y - c.y;
      const len = Math.hypot(dx, dy) || 1;
      const speed = random.range(40, 120);
      particles.push({
        x: at.x,
        y: at.y,
        vx: (dx / len) * speed,
        vy: (dy / len) * speed,
        gravity: 0,
        drag: 0.1,
        rotation: random.range(0, Math.PI),
        spin: random.range(-2, 2),
        flip: 0,
        flipSpeed: 0,
        size: random.range(6, 12) * o.scale,
        color: random.pick(colors),
        shape: 'star',
        age: 0,
        life: random.range(0.6, 1.1),
        twinkle: random.range(6, 10),
      });
    }
    return particles;
  },
});
