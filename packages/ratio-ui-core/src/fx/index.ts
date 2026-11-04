// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui-core/fx` — beta: the model behind the visual effects.
// Particles and their physics, the effects that spawn them, and the rules
// every renderer obeys: how much motion the page allows and the flash cap.
// Nothing here draws; `@eventuras/ratio-ui/fx` does on the web.

export {
  type FxBurst,
  type FxMotion,
  type FxOrigin,
  type FxParticle,
  type FxPoint,
  type FxRect,
  type FxShape,
} from './types';
export { fxRandom, type FxRandom } from './random';
export { FX_MAX_STEP, centerOf, isRect, particleOpacity, stepParticles } from './step';
export { FX_DEFAULT_COLORS, resolveFxColors, tierPalette, type FxColors } from './colors';
export { fxAllowance, fxMotion, type FxAllowance, type FxMotionInput } from './motion';
export { FX_FLASH, admitFlash, flashOpacity, type FlashDecision } from './flash';
export { confetti, type ConfettiOptions } from './confetti';
export { sparkles, type SparklesOptions } from './sparkles';
