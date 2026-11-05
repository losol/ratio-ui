// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The shape every effect is made of. Units are the viewport's CSS pixels and
// seconds; y grows downward, as on a screen.

import type { FxRandom } from './random';

/** A point in the viewport. */
export interface FxPoint {
  x: number;
  y: number;
}

/** A box in the viewport — an element's bounding rect. */
export interface FxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where an effect starts: a point, or the box of the element it celebrates. */
export type FxOrigin = FxPoint | FxRect;

/** What a renderer draws for a particle. */
export type FxShape = 'rect' | 'circle' | 'star';

/**
 * One particle. Each carries its own physics, so one `stepParticles` moves
 * confetti and sparkles alike.
 */
export interface FxParticle {
  x: number;
  y: number;
  /** Velocity, px/s. */
  vx: number;
  vy: number;
  /** Downward pull, px/s². */
  gravity: number;
  /** The share of its velocity a particle keeps over one second, 0–1. */
  drag: number;
  /** Turn in the plane, radians, and its speed, rad/s. */
  rotation: number;
  spin: number;
  /**
   * The flutter of a paper strip turning over: a renderer scales the
   * particle's height by `cos(flip)`. Radians, and its speed, rad/s.
   */
  flip: number;
  flipSpeed: number;
  /** Width in px; a `rect` is drawn half as tall. */
  size: number;
  color: string;
  shape: FxShape;
  /** Seconds since it appeared, and how long it lives. */
  age: number;
  life: number;
  /** Flicker in Hz; 0 for a steady particle that only fades at the end. */
  twinkle: number;
}

/**
 * How much motion the page allows, from the reader's setting and the app's
 * `data-motion` switch. See `fxMotion`.
 */
export type FxMotion = 'full' | 'reduced' | 'none';

/**
 * A burst: it spawns its particles once and ends when the last one dies.
 * `budget` is the most particles it may ever ask for, whatever the options.
 */
export interface FxBurst<Options> {
  readonly name: string;
  readonly kind: 'burst';
  readonly budget: number;
  spawn(origin: FxOrigin, options: Partial<Options>, random: FxRandom): FxParticle[];
}

