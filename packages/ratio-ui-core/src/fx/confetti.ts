// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Confetti: a salvo of paper strips and dots, thrown up and out from a point,
// slowed by the air, falling and turning over as they go.

import { resolveFxColors, type FxColors } from './colors';
import { centerOf } from './step';
import type { FxBurst, FxParticle, FxShape } from './types';

export interface ConfettiOptions {
  /** How many pieces. Capped at the effect's budget. @default 90 */
  count: number;
  /** The direction of the throw in degrees: 90 is straight up, 0 to the right. @default 90 */
  angle: number;
  /** How wide the salvo fans out around `angle`, in degrees. @default 70 */
  spread: number;
  /** Launch speed, px/s; each piece varies ±30 % around it. @default 1100 */
  velocity: number;
  /** Size multiplier for every piece. @default 1 */
  scale: number;
  colors: FxColors;
}

const DEFAULTS: Omit<ConfettiOptions, 'colors'> = {
  count: 90,
  angle: 90,
  spread: 70,
  velocity: 1100,
  scale: 1,
};

const SHAPES: readonly FxShape[] = ['rect', 'rect', 'rect', 'circle'];

const DEG = Math.PI / 180;

/** The most pieces one salvo may throw. */
const BUDGET = 300;

/** The confetti salvo. `play(confetti, …)` on the web; any renderer can draw its particles. */
export const confetti: FxBurst<ConfettiOptions> = Object.freeze<FxBurst<ConfettiOptions>>({
  name: 'confetti',
  kind: 'burst',
  budget: BUDGET,
  spawn(origin, options, random) {
    const o = { ...DEFAULTS, ...options };
    const colors = resolveFxColors(options.colors);
    const count = Math.max(0, Math.min(Math.round(o.count), BUDGET));
    const from = centerOf(origin);
    const particles: FxParticle[] = [];
    for (let i = 0; i < count; i++) {
      const direction = (o.angle + random.range(-o.spread / 2, o.spread / 2)) * DEG;
      const speed = o.velocity * random.range(0.7, 1.3);
      particles.push({
        x: from.x,
        y: from.y,
        vx: Math.cos(direction) * speed,
        vy: -Math.sin(direction) * speed,
        gravity: 1800,
        drag: 0.3,
        rotation: random.range(0, 2 * Math.PI),
        spin: random.range(-8, 8),
        flip: random.range(0, 2 * Math.PI),
        flipSpeed: random.range(6, 14),
        size: random.range(7, 11) * o.scale,
        color: random.pick(colors),
        shape: random.pick(SHAPES),
        age: 0,
        life: random.range(2.4, 3.4),
        twinkle: 0,
      });
    }
    return particles;
  },
});
