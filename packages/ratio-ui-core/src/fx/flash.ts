// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The flash cap. Lightning brightens the page; three flashes in any one
// second is the most WCAG 2.3.1 allows, and a full-white flash is never
// needed. Every effect that flashes goes through here.

const PER_SECOND = 3;
const MAX_OPACITY = 0.35;
const WINDOW_MS = 1000;

/**
 * The limits on any flash of the page, for reading. Frozen, and the checks
 * below use their own copies, so no caller can raise the cap.
 */
export const FX_FLASH: Readonly<{ perSecond: number; maxOpacity: number }> = Object.freeze({
  /** At most this many flashes start in any one second (WCAG 2.3.1). */
  perSecond: PER_SECOND,
  /** The brightest a flash overlay may be, 0–1: a dimmed flash, never white-out. */
  maxOpacity: MAX_OPACITY,
});

export interface FlashDecision {
  /** Whether this flash may start now. */
  allowed: boolean;
  /** The start times to keep, in ms — this one included when allowed. */
  history: number[];
}

/**
 * Ask to start a flash at `now` (ms). `history` holds the start times of
 * earlier flashes; pass back the one returned. A refused flash should
 * simply not show — the rest of the effect still plays.
 */
export function admitFlash(history: readonly number[], now: number): FlashDecision {
  const recent = history.filter(t => t > now - WINDOW_MS && t <= now);
  if (recent.length >= PER_SECOND) return { allowed: false, history: recent };
  return { allowed: true, history: [...recent, now] };
}

/** A flash overlay's opacity, held under the cap. */
export const flashOpacity = (requested: number): number =>
  Math.min(Math.max(requested, 0), MAX_OPACITY);
