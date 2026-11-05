// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Lightning: a jagged bolt from the sky to the target, a branch or two off
// it, a flash of the page and an optional shake of what was struck. The
// flashes are a plan; every renderer puts each through `admitFlash`.

import type { FxRandom } from './random';
import { fxRandom } from './random';
import { centerOf, isRect } from './step';
import type { FxBolt, FxPoint, FxStrike } from './types';

export interface LightningOptions {
  /**
   * Where the bolt comes from. Default: the top of the viewport (y 0),
   * a little to one side of the target.
   */
  from: FxPoint;
  /** How jagged the bolt is, 0–1. @default 0.5 */
  roughness: number;
  /** Branches off the main channel. At most 4. @default 2 */
  branches: number;
  /** A second, weaker flash as the channel re-strikes. @default true */
  restrike: boolean;
  /** Shake the target, px at most; 0 for none. At most 12. @default 0 */
  shake: number;
}

const DEFAULTS: Omit<LightningOptions, 'from'> = {
  roughness: 0.5,
  branches: 2,
  restrike: true,
  shake: 0,
};

const MAX_BRANCHES = 4;
const MAX_SHAKE = 12;
/** Halvings of each segment: 2^6 = 64 segments in the main channel. */
const DEPTH = 6;
const DURATION = 450;
const RESTRIKE_AT = 140;
const SHAKE_DURATION = 420;

/** A jagged line from `a` to `b`: each segment halved and its midpoint pushed aside. */
function channel(a: FxPoint, b: FxPoint, roughness: number, depth: number, random: FxRandom): FxPoint[] {
  let points: FxPoint[] = [a, b];
  let spread = Math.hypot(b.x - a.x, b.y - a.y) * 0.25 * roughness;
  for (let level = 0; level < depth; level++) {
    const next: FxPoint[] = [points[0]!];
    for (let i = 1; i < points.length; i++) {
      const p = points[i - 1]!;
      const q = points[i]!;
      const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      // Push the midpoint along the segment's normal.
      const nx = -(q.y - p.y) / len;
      const ny = (q.x - p.x) / len;
      const off = random.range(-spread, spread);
      next.push({ x: (p.x + q.x) / 2 + nx * off, y: (p.y + q.y) / 2 + ny * off }, q);
    }
    points = next;
    spread /= 2;
  }
  return points;
}

/**
 * Where a shaking element is `t` ms into a shake: a jitter that dies away
 * by `duration`. The same `seed` gives the same shake.
 */
export function shakeOffset(t: number, duration: number, amplitude: number, seed: number): FxPoint {
  if (t < 0 || t >= duration || amplitude <= 0) return { x: 0, y: 0 };
  const decay = 1 - t / duration;
  const step = Math.floor(t / 30);
  const random = fxRandom((seed + step * 7919) >>> 0);
  return {
    x: random.range(-1, 1) * amplitude * decay,
    y: random.range(-1, 1) * amplitude * decay * 0.5,
  };
}

/** Lightning. `play(lightning, …)` on the web. */
export const lightning: FxStrike<LightningOptions> = Object.freeze<FxStrike<LightningOptions>>({
  name: 'lightning',
  kind: 'strike',
  strike(origin, options, random) {
    const o = { ...DEFAULTS, ...options };
    const roughness = Math.min(Math.max(o.roughness, 0), 1);
    const branches = Math.max(0, Math.min(Math.round(o.branches), MAX_BRANCHES));
    const c = centerOf(origin);
    // To the top edge of an element, as if it was struck.
    const to: FxPoint = { x: c.x, y: isRect(origin) ? origin.y : c.y };
    const from: FxPoint = options.from ?? { x: to.x + random.range(-120, 120), y: 0 };

    const main = channel(from, to, roughness, DEPTH, random);
    const bolts: FxBolt[] = [{ points: main, width: 3, branch: false }];
    for (let i = 0; i < branches; i++) {
      // Off the upper two-thirds, angled down and away.
      const start = main[Math.floor(random.range(0.1, 0.66) * main.length)]!;
      const rest = Math.hypot(to.x - start.x, to.y - start.y);
      const side = random.next() < 0.5 ? -1 : 1;
      const end: FxPoint = {
        x: start.x + side * rest * random.range(0.2, 0.45),
        y: start.y + rest * random.range(0.25, 0.5),
      };
      bolts.push({ points: channel(start, end, roughness, DEPTH - 2, random), width: 1.5, branch: true });
    }

    return {
      bolts,
      flashes: o.restrike ? [0, RESTRIKE_AT] : [0],
      duration: DURATION,
      shake: Math.min(Math.max(o.shake, 0), MAX_SHAKE),
      shakeDuration: SHAKE_DURATION,
      seed: Math.floor(random.next() * 2 ** 32),
    };
  },
});
