// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { confetti, type ConfettiOptions } from './confetti';
import { fireworks, type FireworksOptions } from './fireworks';
import { snow, type AmbientOptions } from './ambient';
import type { FxAmbient, FxBurst } from './types';

/** Red, white and blue paper for 17 May. Explicit options override the preset. */
export const nationalDay: FxBurst<ConfettiOptions> = Object.freeze<FxBurst<ConfettiOptions>>({
  ...confetti,
  name: 'nationalDay',
  colors: ['#ba0c2f', '#ffffff', '#00205b'],
  spawn: (origin, options, random) => confetti.spawn(origin, {
    colors: ['#ba0c2f', '#ffffff', '#00205b'], count: 120, ...options,
  }, random),
});

/** A gold New Year salvo. A burst, with no automatic sound or calendar trigger. */
export const newYear: FxBurst<FireworksOptions> = Object.freeze<FxBurst<FireworksOptions>>({
  ...fireworks,
  name: 'newYear',
  colors: 'tier:gold',
  spawn: (origin, options, random) => fireworks.spawn(origin, {
    colors: 'tier:gold', rockets: 4, ...options,
  }, random),
});

/** A quiet December flurry. Runs until stopped, just like snow. */
export const winter: FxAmbient<AmbientOptions> = Object.freeze<FxAmbient<AmbientOptions>>({
  ...snow,
  name: 'winter',
  spawn: (viewport, options, random) => snow.spawn(viewport, { intensity: 0.25, ...options }, random),
});
