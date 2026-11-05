// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui/fx` — beta: visual effects on the page. The model
// (the effects, their physics and the rules on motion and flashes) is
// `@eventuras/ratio-ui-core/fx`, re-exported here so an app needs one
// import; the drawing is this module's.

export { play, type FxPlayback, type PlayOptions } from './play';
export { useFx } from './useFx';
export {
  confetti,
  sparkles,
  fireworks,
  lightning,
  fxMotion,
  fxAllowance,
  type ConfettiOptions,
  type SparklesOptions,
  type FireworksOptions,
  type LightningOptions,
  type FxBurst,
  type FxStrike,
  type FxEffect,
  type FxColors,
  type FxMotion,
  type FxOrigin,
} from '@eventuras/ratio-ui-core/fx';
