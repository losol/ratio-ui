// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { resolveFxColors, type FxColors } from './colors';
import { stepParticles } from './step';
import type { FxRandom } from './random';
import type { FxAmbient, FxParticle, FxRect } from './types';

export interface AmbientOptions {
  /** Share of the live-particle budget, clamped to 0–1. @default 0.4 */
  intensity: number;
  /** Horizontal wind, px/s. @default 12 for snow, 80 for rain */
  wind: number;
  /** Defaults to off-white snow or muted blue rain; independent of theme. */
  colors: FxColors;
}

function field(name: string, budget: number, rain: boolean): FxAmbient<AmbientOptions> {
  return Object.freeze<FxAmbient<AmbientOptions>>({
    name,
    kind: 'ambient',
    budget,
    spawn(viewport, options, random) {
      const intensity = options.intensity ?? 0.4;
      const count = Math.round(budget * (Number.isFinite(intensity) ? Math.max(0, Math.min(1, intensity)) : 0));
      const wind = options.wind ?? (rain ? 80 : 12);
      const vx = Number.isFinite(wind) ? Math.max(-500, Math.min(500, wind)) : 0;
      const colors = resolveFxColors(options.colors ?? [rain ? '#7696b3' : '#e8eef5']);
      return Array.from({ length: count }, () => {
        const vy = rain ? random.range(550, 850) : random.range(25, 65);
        return {
          x: viewport.x + random.range(0, Math.max(0, viewport.width)),
          y: viewport.y + random.range(0, Math.max(0, viewport.height)),
          vx: vx * random.range(0.8, 1.2),
          vy,
          gravity: 0,
          drag: 1,
          rotation: rain ? -Math.atan2(vx, vy) : 0,
          spin: 0,
          flip: 0,
          flipSpeed: 0,
          size: rain ? random.range(10, 18) : random.range(3, 8),
          color: random.pick(colors),
          shape: rain ? 'line' : 'circle',
          age: 0,
          life: Infinity,
          twinkle: 0,
        };
      });
    },
    recycle(particle, viewport, random) {
      return {
        ...particle,
        x: viewport.x + random.range(0, Math.max(0, viewport.width)),
        y: viewport.y - particle.size,
        age: 0,
      };
    },
  });
}

/** A slow continuous flurry, at most 120 live flakes. */
export const snow = field('snow', 120, false);
/** A continuous shower, at most 200 live drops. No lightning or sound. */
export const rain = field('rain', 200, true);

/** Advance a field without mutating it; recycle below or beside the viewport. */
export function stepAmbient<Options>(
  effect: FxAmbient<Options>, particles: readonly FxParticle[], viewport: FxRect,
  random: FxRandom, dt: number,
): FxParticle[] {
  return stepParticles(particles.slice(0, effect.budget), dt).map(p =>
    p.y > viewport.y + viewport.height + p.size ||
    p.x < viewport.x - p.size || p.x > viewport.x + viewport.width + p.size
      ? effect.recycle(p, viewport, random) : p,
  );
}
