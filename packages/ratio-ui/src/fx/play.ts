// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The web renderer for `@eventuras/ratio-ui-core/fx`: one canvas over the
// page, one animation loop for every effect that is playing, and the rules
// the model sets — asked here before anything moves.
//
// No React in this module, so `play()` works from any script; `useFx()` is
// the React wrapper.

import {
  fxAllowance,
  fxMotion,
  fxRandom,
  particleOpacity,
  stepParticles,
  type FxBurst,
  type FxColors,
  type FxMotion,
  type FxOrigin,
  type FxParticle,
} from '@eventuras/ratio-ui-core/fx';
import './fx.css';

export interface PlayOptions {
  /**
   * Where the effect starts: an element (its box on the page), or a point
   * or box in viewport pixels. Default: the middle of the viewport.
   */
  origin?: Element | FxOrigin | null;
  /**
   * The colours to throw: a list, or `'tier:gold'` and friends for a
   * badge's metal. Default: the theme's primary, accent and status colours
   * where the effect starts.
   */
  colors?: FxColors;
  /** Fixes the randomness, for a burst that is the same every time. */
  seed?: number;
}

/** An effect that is playing, or was refused. */
export interface FxPlayback {
  /** How much motion the page allowed: only `full` draws the effect. */
  readonly motion: FxMotion;
  /** Settles when the effect is over or stopped. */
  readonly finished: Promise<void>;
  /** Takes the effect off the page now. */
  stop(): void;
}

interface Run {
  particles: FxParticle[];
  done: () => void;
}

/** How long the still acknowledgement stays under reduced motion, ms. */
const ACK_MS = 900;

/** The theme colours an effect throws when it is given none. */
const THEME_COLORS = [
  '--primary',
  '--accent',
  '--success-solid',
  '--warning-solid',
  '--info-solid',
  '--error-solid',
];

const runs = new Set<Run>();
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let frame = 0;
let last = 0;

function resize() {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  // CSS size and bitmap from one measure, so a particle lands where the
  // element it started from is.
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const canPopover = (el: HTMLElement) => typeof el.showPopover === 'function';

/**
 * Puts the canvas on top of the top layer: shown as a popover after any
 * modal dialog opened since, so it is never under the UI it celebrates.
 */
function raise() {
  if (!canvas || !canPopover(canvas)) return;
  try {
    if (canvas.matches(':popover-open')) canvas.hidePopover();
    canvas.showPopover();
  } catch {
    // Not connected, or the browser refused: the z-index still stands.
  }
}

/** The overlay, made on first use. Null where a canvas cannot draw. */
function overlay(): CanvasRenderingContext2D | null {
  if (ctx) return ctx;
  const el = document.createElement('canvas');
  const context = el.getContext('2d');
  if (!context) return null;
  el.className = 'ratio-fx-canvas';
  el.setAttribute('aria-hidden', 'true');
  el.dataset.ratioFx = '';
  if (canPopover(el)) el.popover = 'manual';
  document.body.appendChild(el);
  canvas = el;
  ctx = context;
  resize();
  window.addEventListener('resize', resize);
  return ctx;
}

function teardown() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  window.removeEventListener('resize', resize);
  canvas?.remove();
  canvas = null;
  ctx = null;
}

function drawStar(c: CanvasRenderingContext2D, size: number) {
  const outer = size / 2;
  const inner = size / 8;
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 4;
    c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  c.closePath();
  c.fill();
}

function draw(c: CanvasRenderingContext2D, p: FxParticle) {
  c.save();
  c.globalAlpha = particleOpacity(p);
  c.fillStyle = p.color;
  c.translate(p.x, p.y);
  c.rotate(p.rotation);
  if (p.shape === 'star') {
    drawStar(c, p.size);
  } else {
    // The flutter: a strip turning over shows its edge.
    c.scale(1, Math.cos(p.flip));
    if (p.shape === 'circle') {
      c.beginPath();
      c.arc(0, 0, p.size * 0.3, 0, 2 * Math.PI);
      c.fill();
    } else {
      c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
  }
  c.restore();
}

function tick(now: number) {
  const c = ctx;
  if (!c || !canvas) return;
  const dt = (now - last) / 1000;
  last = now;
  c.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const run of runs) {
    run.particles = stepParticles(run.particles, dt);
    if (run.particles.length === 0) {
      runs.delete(run);
      run.done();
      continue;
    }
    for (const p of run.particles) draw(c, p);
  }
  if (runs.size > 0) frame = requestAnimationFrame(tick);
  else teardown();
}

function start(run: Run): boolean {
  if (!overlay()) return false;
  raise();
  runs.add(run);
  if (!frame) {
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  return true;
}

function originOf(origin: PlayOptions['origin']): { element: Element | null; at: FxOrigin } {
  if (origin && typeof (origin as Element).getBoundingClientRect === 'function') {
    const element = origin as Element;
    const r = element.getBoundingClientRect();
    return { element, at: { x: r.left, y: r.top, width: r.width, height: r.height } };
  }
  if (origin) return { element: null, at: origin as FxOrigin };
  return { element: null, at: { x: window.innerWidth / 2, y: window.innerHeight / 2 } };
}

function themeColors(scope: Element): string[] {
  const style = getComputedStyle(scope);
  return THEME_COLORS.map(name => style.getPropertyValue(name).trim()).filter(Boolean);
}

/** Rings showing per element, so overlapping acknowledgements end in turn. */
const rings = new WeakMap<Element, number>();

/** Shows the ring round `element` for `ACK_MS`; ends early on `stop()`, once. */
function acknowledge(element: Element, motion: FxMotion): FxPlayback {
  rings.set(element, (rings.get(element) ?? 0) + 1);
  element.setAttribute('data-fx-ack', '');
  let ended = false;
  let resolve = () => {};
  const finished = new Promise<void>(r => {
    resolve = r;
  });
  const end = () => {
    if (ended) return;
    ended = true;
    window.clearTimeout(timer);
    const left = (rings.get(element) ?? 1) - 1;
    if (left > 0) rings.set(element, left);
    else {
      rings.delete(element);
      element.removeAttribute('data-fx-ack');
    }
    resolve();
  };
  const timer = window.setTimeout(end, ACK_MS);
  return { motion, finished, stop: end };
}

const settled = (motion: FxMotion): FxPlayback => ({
  motion,
  finished: Promise.resolve(),
  stop() {},
});

/**
 * Play an effect over the page and return at once. Under
 * `prefers-reduced-motion` nothing moves: the element the effect was for
 * gets a ring for a moment instead. Inside `data-motion="none"` nothing
 * happens at all.
 *
 * @example
 * play(confetti, { origin: button });
 * play(sparkles, { origin: badgeRef.current, colors: 'tier:gold' });
 */
export function play<Options>(
  effect: FxBurst<Options>,
  options: Partial<Options> & PlayOptions = {},
): FxPlayback {
  if (typeof window === 'undefined' || typeof document === 'undefined') return settled('none');

  const { origin, colors, seed, ...rest } = options;
  const { element, at } = originOf(origin);
  const scope = element ?? document.body ?? document.documentElement;
  const motion = fxMotion({
    prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    motionNone: scope.closest('[data-motion="none"]') !== null,
  });
  const allowed = fxAllowance(motion);

  if (!allowed.particles) {
    if (!allowed.fallback || !element) return settled(motion);
    return acknowledge(element, motion);
  }

  const palette = colors ?? themeColors(scope);
  const particles = effect.spawn(
    at,
    { ...(rest as Partial<Options>), colors: palette.length > 0 ? palette : undefined },
    fxRandom(seed ?? Math.floor(Math.random() * 2 ** 32)),
  );

  let resolve = () => {};
  const finished = new Promise<void>(r => {
    resolve = r;
  });
  const run: Run = { particles, done: resolve };
  if (particles.length === 0 || !start(run)) {
    resolve();
    return { motion, finished, stop() {} };
  }
  return {
    motion,
    finished,
    stop() {
      if (!runs.delete(run)) return;
      resolve();
      if (runs.size === 0) teardown();
    },
  };
}
