// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Fireworks: rockets that rise one after another from the origin and burst
// into a sphere of sparks at the top, each shell in a colour or two of the
// palette. The bursts are in the rockets' `shell`; `stepParticles` sets them
// off, so a renderer draws fireworks like any other burst.

import { resolveFxColors, type FxColors } from './colors';
import { centerOf, isRect } from './step';
import type { FxBurst, FxParticle } from './types';

export interface FireworksOptions {
  /** How many rockets. At most 6. @default 3 */
  rockets: number;
  /** How high they rise above the origin before they burst, px. @default 360 */
  height: number;
  /** How far apart, side to side, the bursts may be, px. @default 320 */
  width: number;
  /** Sparks in each shell. At most 80. @default 60 */
  sparks: number;
  /** Seconds between one launch and the next. @default 0.35 */
  interval: number;
  colors: FxColors;
}

const DEFAULTS: Omit<FireworksOptions, 'colors'> = {
  rockets: 3,
  height: 360,
  width: 320,
  sparks: 60,
  interval: 0.35,
};

const MAX_ROCKETS = 6;
const MAX_SPARKS = 80;
/** Every rocket and every spark of its shell. */
const BUDGET = MAX_ROCKETS * (MAX_SPARKS + 1);

/** Fireworks. `play(fireworks, …)` on the web; any renderer can draw its particles. */
export const fireworks: FxBurst<FireworksOptions> = Object.freeze<FxBurst<FireworksOptions>>({
  name: 'fireworks',
  kind: 'burst',
  budget: BUDGET,
  spawn(origin, options, random) {
    const o = { ...DEFAULTS, ...options };
    const colors = resolveFxColors(options.colors);
    const rockets = Math.max(0, Math.min(Math.round(o.rockets), MAX_ROCKETS));
    const sparks = Math.max(0, Math.min(Math.round(o.sparks), MAX_SPARKS));
    const height = Math.max(0, o.height);
    const interval = Math.max(0, o.interval);
    const from = centerOf(origin);
    // From the top of an element, so the rockets do not rise through it.
    const y = isRect(origin) ? origin.y : from.y;
    const particles: FxParticle[] = [];
    for (let i = 0; i < rockets; i++) {
      const rise = height * random.range(0.75, 1);
      const life = random.range(0.7, 0.95);
      const drift = random.range(-o.width / 2, o.width / 2);
      const main = random.pick(colors);
      particles.push({
        x: from.x,
        y,
        vx: drift / life,
        vy: -rise / life,
        gravity: 0,
        drag: 1,
        rotation: 0,
        spin: 0,
        flip: 0,
        flipSpeed: 0,
        size: 9,
        color: main,
        shape: 'circle',
        age: -i * interval,
        life,
        twinkle: 0,
        shell: {
          count: sparks,
          speed: random.range(220, 320),
          colors: random.next() < 0.5 ? [main] : [main, random.pick(colors)],
          life: random.range(1.1, 1.5),
          seed: Math.floor(random.next() * 2 ** 32),
        },
      });
    }
    return particles;
  },
});
