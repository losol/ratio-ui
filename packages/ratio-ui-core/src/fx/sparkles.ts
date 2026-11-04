// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Sparkles: a ring of small stars around the element that earned them,
// drifting outward and twinkling out. The quiet one, for small wins.

import { resolveFxColors, type FxColors } from './colors';
import { centerOf, isRect } from './step';
import type { FxBurst, FxParticle } from './types';

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

/** Around a bare point, the stars ring a box this wide. */
const POINT_RADIUS = 24;

/** Sparkles around an element. `play(sparkles, …)` on the web. */
export const sparkles: FxBurst<SparklesOptions> = {
  name: 'sparkles',
  kind: 'burst',
  budget: 60,
  spawn(origin, options, random) {
    const o = { ...DEFAULTS, ...options };
    const colors = resolveFxColors(options.colors);
    const count = Math.max(0, Math.min(Math.round(o.count), sparkles.budget));
    const c = centerOf(origin);
    const rx = (isRect(origin) ? origin.width / 2 : POINT_RADIUS) + o.inset;
    const ry = (isRect(origin) ? origin.height / 2 : POINT_RADIUS) + o.inset;
    const particles: FxParticle[] = [];
    for (let i = 0; i < count; i++) {
      // Evenly round the ring, nudged so it does not look stamped.
      const a = ((i + random.range(-0.35, 0.35)) / Math.max(count, 1)) * 2 * Math.PI;
      const speed = random.range(40, 120);
      particles.push({
        x: c.x + Math.cos(a) * rx,
        y: c.y + Math.sin(a) * ry,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
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
};
