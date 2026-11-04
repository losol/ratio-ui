// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// What an effect may do, from how much motion the page allows. Every
// renderer asks here, so none of them can forget the reader's setting or a
// mourning period.

import type { FxMotion } from './types';

export interface FxMotionInput {
  /** The reader's `prefers-reduced-motion: reduce`. */
  prefersReducedMotion: boolean;
  /** The app's `data-motion="none"` on the page (mourning, or stillness by design). */
  motionNone: boolean;
}

/** `none` wins over `reduced`, which wins over `full`. */
export function fxMotion({ prefersReducedMotion, motionNone }: FxMotionInput): FxMotion {
  if (motionNone) return 'none';
  if (prefersReducedMotion) return 'reduced';
  return 'full';
}

/** What an effect may do under a motion level. */
export interface FxAllowance {
  /** Moving particles. */
  particles: boolean;
  /** A flash of the page (lightning). */
  flash: boolean;
  /** Shaking an element. */
  shake: boolean;
  /**
   * A still acknowledgement instead of the effect — the renderer's own,
   * such as the `pop` a copy button shows. Under `none` there is not even
   * that: the page is meant to be still.
   */
  fallback: boolean;
}

// Frozen, and copied out: a caller that edits its answer must not loosen the
// rule for every effect after it.
const ALLOWANCE: Readonly<Record<FxMotion, Readonly<FxAllowance>>> = Object.freeze({
  full: Object.freeze({ particles: true, flash: true, shake: true, fallback: false }),
  reduced: Object.freeze({ particles: false, flash: false, shake: false, fallback: true }),
  none: Object.freeze({ particles: false, flash: false, shake: false, fallback: false }),
});

/** What an effect may do. Only `full` moves anything. A fresh object each call. */
export const fxAllowance = (motion: FxMotion): FxAllowance => ({ ...ALLOWANCE[motion] });
