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
  /**
   * What the particle bursts into when its life is over: a firework's
   * rocket carries its shell. `stepParticles` spawns it where the rocket is.
   */
  shell?: FxShell;
}

/** The sparks a rocket bursts into. */
export interface FxShell {
  /** How many sparks. */
  count: number;
  /** Their launch speed, px/s; each varies between 60 and 100 % of it. */
  speed: number;
  colors: readonly string[];
  /** How long they live, s; each varies ±20 %. */
  life: number;
  /** The shell's own randomness, so the burst is the same every time. */
  seed: number;
}

/**
 * How much motion the page allows, from the reader's setting and the app's
 * `data-motion` switch. See `fxMotion`.
 */
export type FxMotion = 'full' | 'reduced' | 'none';

/**
 * A burst: it spawns its particles once and ends when the last one dies.
 * `budget` is the most particles it may ever ask for, whatever the options
 * — the sparks its rockets burst into included.
 */
export interface FxBurst<Options> {
  readonly name: string;
  readonly kind: 'burst';
  readonly budget: number;
  spawn(origin: FxOrigin, options: Partial<Options>, random: FxRandom): FxParticle[];
}

/** One stroke of a lightning bolt: the main channel or a branch. */
export interface FxBolt {
  points: readonly FxPoint[];
  /** Line width, px. */
  width: number;
  /** A branch is thinner and fades sooner than the main channel. */
  branch: boolean;
}

/** Everything a strike does, laid out in time from its start. */
export interface FxStrikePlan {
  bolts: readonly FxBolt[];
  /**
   * When the page flashes, ms from the start. Each still goes through
   * `admitFlash`; the renderer drops one the cap refuses.
   */
  flashes: readonly number[];
  /** How long the bolt shows, ms. */
  duration: number;
  /** How far the target shakes at most, px; 0 for no shake. */
  shake: number;
  /** How long it shakes, ms. */
  shakeDuration: number;
  /** The randomness of the shake, for `shakeOffset`. */
  seed: number;
}

/**
 * A strike: a drawing laid out in time rather than particles — lightning.
 */
export interface FxStrike<Options> {
  readonly name: string;
  readonly kind: 'strike';
  strike(origin: FxOrigin, options: Partial<Options>, random: FxRandom): FxStrikePlan;
}

/** Any effect a renderer can play. */
export type FxEffect<Options> = FxBurst<Options> | FxStrike<Options>;

