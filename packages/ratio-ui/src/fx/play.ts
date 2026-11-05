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
  admitFlash,
  flashOpacity,
  fxAllowance,
  fxMotion,
  fxRandom,
  particleOpacity,
  shakeOffset,
  stepParticles,
  stepAmbient,
  type FxBolt,
  type FxColors,
  type FxEffect,
  type FxMotion,
  type FxOrigin,
  type FxParticle,
  type FxStrikePlan,
} from '@eventuras/ratio-ui-core/fx';
import './fx.css';

export interface PlayOptions {
  /**
   * Where the effect starts: an element (its box on the page), or a point
   * or box in viewport pixels. Default: the middle of the viewport.
   * Ambient fields cover the viewport; origin only selects motion scope and fallback.
   */
  origin?: Element | FxOrigin | null;
  /**
   * The colours to throw: a list, or `'tier:gold'` and friends for a
   * badge's metal. Default: the theme's primary, accent and status colours
   * where the effect starts.
   */
  colors?: FxColors;
  /** Fixes the randomness, including ambient recycling for the same frame steps. */
  seed?: number;
  /**
   * Thunder after lightning. Off by default, and only ever after the reader
   * has interacted with the page, and only under full motion.
   */
  sound?: boolean;
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

interface Strike {
  plan: FxStrikePlan;
  start: number;
  /** Flashes already asked for. */
  asked: number;
}

interface Run {
  particles: FxParticle[];
  strike?: Strike;
  permitted?: () => boolean;
  ambient?: (particles: FxParticle[], dt: number) => FxParticle[];
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

/** How long one flash lights the page, ms. */
const FLASH_MS = 80;
/** The flash's tint: a cold white. */
const FLASH_RGB = '235, 242, 255';

const runs = new Set<Run>();
/** Start times of the page's flashes, for `admitFlash`. Shared by every effect. */
let flashHistory: number[] = [];
let flashUntil = 0;
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
  // The flash went with the canvas. A new canvas shows only flashes the cap
  // admits from now on; the history of earlier ones stays.
  flashUntil = 0;
  window.removeEventListener('resize', resize);
  document.removeEventListener('visibilitychange', visibility);
  canvas?.remove();
  canvas = null;
  ctx = null;
  hiddenAt = null;
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
  if (p.shape === 'line') {
    c.fillRect(-0.6, -p.size / 2, 1.2, p.size);
  } else if (p.shape === 'star') {
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

function drawBolt(c: CanvasRenderingContext2D, bolt: FxBolt, alpha: number) {
  if (alpha <= 0 || bolt.points.length < 2) return;
  c.save();
  c.globalAlpha = Math.min(alpha, 1);
  c.strokeStyle = '#eef4ff';
  c.shadowColor = '#9ec5ff';
  c.shadowBlur = bolt.branch ? 8 : 18;
  c.lineWidth = bolt.width;
  c.lineJoin = 'round';
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(bolt.points[0]!.x, bolt.points[0]!.y);
  for (const p of bolt.points.slice(1)) c.lineTo(p.x, p.y);
  c.stroke();
  c.restore();
}

/** Asks for the strike's due flashes and draws its bolts. True while it lasts. */
function drawStrike(c: CanvasRenderingContext2D, strike: Strike, now: number): boolean {
  const { plan } = strike;
  const elapsed = now - strike.start;
  while (strike.asked < plan.flashes.length && plan.flashes[strike.asked]! <= elapsed) {
    const decision = admitFlash(flashHistory, now);
    flashHistory = decision.history;
    if (decision.allowed) flashUntil = Math.max(flashUntil, now + FLASH_MS);
    strike.asked++;
  }
  if (elapsed < plan.duration) {
    const fade = 1 - elapsed / plan.duration;
    // The channel flickers as it fades; branches go first.
    const flicker = 0.65 + 0.35 * Math.sin(elapsed / 17);
    for (const bolt of plan.bolts) {
      drawBolt(c, bolt, bolt.branch ? (fade - 0.3) * flicker * 1.4 : fade * flicker + 0.15);
    }
  }
  const lastFlash = plan.flashes.length > 0 ? plan.flashes[plan.flashes.length - 1]! : 0;
  return elapsed < Math.max(plan.duration, lastFlash + FLASH_MS);
}

function tick(now: number) {
  const c = ctx;
  if (!c || !canvas) return;
  const dt = (now - last) / 1000;
  last = now;
  const width = window.innerWidth;
  const height = window.innerHeight;
  c.clearRect(0, 0, width, height);
  // Asked for first, so this frame's flash sits under this frame's bolts.
  const lit: Run[] = [];
  for (const run of runs) {
    if (run.permitted && !run.permitted()) {
      runs.delete(run);
      run.done();
      continue;
    }
    run.particles = run.ambient ? run.ambient(run.particles, dt) : stepParticles(run.particles, dt);
    const striking = run.strike ? drawStrike(c, run.strike, now) : false;
    if (run.particles.length === 0 && !striking && !run.ambient) {
      runs.delete(run);
      run.done();
      continue;
    }
    lit.push(run);
  }
  if (now < flashUntil) {
    c.save();
    c.globalCompositeOperation = 'destination-over';
    c.fillStyle = `rgba(${FLASH_RGB}, ${flashOpacity(1)})`;
    c.fillRect(0, 0, width, height);
    c.restore();
  }
  for (const run of lit) for (const p of run.particles) draw(c, p);
  if (runs.size > 0) frame = requestAnimationFrame(tick);
  else teardown();
}

/** Freeze the shared clock while hidden, including strike timelines. */
let hiddenAt: number | null = null;
function visibility() {
  if (document.hidden) {
    hiddenAt ??= performance.now();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  } else if (runs.size > 0 && !frame) {
    const now = performance.now();
    for (const run of runs) {
      if (run.strike) run.strike.start += now - Math.max(hiddenAt ?? now, run.strike.start);
    }
    hiddenAt = null;
    last = now;
    frame = requestAnimationFrame(tick);
  }
}

function start(run: Run): boolean {
  if (!overlay()) return false;
  raise();
  runs.add(run);
  document.addEventListener('visibilitychange', visibility);
  if (document.hidden) {
    visibility();
  } else if (!frame) {
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  return true;
}

/** Shakes an element, on top of whatever transform it has. */
function shake(element: Element, plan: FxStrikePlan): Animation | null {
  if (plan.shake <= 0 || typeof (element as HTMLElement).animate !== 'function') return null;
  const frames: Keyframe[] = [];
  for (let t = 0; t <= plan.shakeDuration; t += 30) {
    const { x, y } = shakeOffset(t, plan.shakeDuration, plan.shake, plan.seed);
    frames.push({ transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` });
  }
  return (element as HTMLElement).animate(frames, { duration: plan.shakeDuration, composite: 'add' });
}

/** Has the reader interacted with the page? Browsers block sound until then. */
const activated = () =>
  (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive ?? false;

/** Thunder that is playing: stop it, or wait for it to end. */
interface Rumble {
  stop(): void;
  ended: Promise<void>;
}

/**
 * A low rumble of filtered noise, after a delay. Null where there is no
 * audio. `ended` settles when the sound is over, when it is stopped, or —
 * if the browser keeps the audio suspended — when it would have been over.
 */
function thunder(delaySeconds: number): Rumble | null {
  const Audio = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Audio) return null;
  let audio: AudioContext;
  try {
    audio = new Audio();
  } catch {
    return null;
  }
  const length = 2.6;
  let source: AudioBufferSourceNode | null = null;
  let done = false;
  let resolve = () => {};
  const ended = new Promise<void>(r => {
    resolve = r;
  });
  const finish = () => {
    if (done) return;
    done = true;
    window.clearTimeout(cap);
    try {
      source?.stop();
    } catch {
      // Already stopped.
    }
    void audio.close().catch(() => {});
    resolve();
  };
  // A suspended context never plays or ends; end by the clock instead.
  const cap = window.setTimeout(finish, (delaySeconds + length) * 1000 + 250);
  try {
    const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * length), audio.sampleRate);
    const data = buffer.getChannelData(0);
    // Brown noise: white noise, integrated, so the energy is low.
    let level = 0;
    for (let i = 0; i < data.length; i++) {
      level = (level + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = level * 3.5;
    }
    source = audio.createBufferSource();
    source.buffer = buffer;
    const filter = audio.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 220;
    const gain = audio.createGain();
    const at = audio.currentTime + delaySeconds;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.9, at + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.35, at + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    source.connect(filter).connect(gain).connect(audio.destination);
    source.onended = finish;
    source.start(at);
  } catch {
    // No sound is never an error worth surfacing.
    finish();
  }
  return { stop: finish, ended };
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
 * happens at all. Every flash of the page goes through the model's cap:
 * at most three in a second, never white-out.
 *
 * @example
 * play(confetti, { origin: button });
 * play(sparkles, { origin: badgeRef.current, colors: 'tier:gold' });
 * play(lightning, { origin: card, shake: 8, sound: true });
 */
export function play<Options>(
  effect: FxEffect<Options>,
  options: Partial<Options> & PlayOptions = {},
): FxPlayback {
  if (typeof window === 'undefined' || typeof document === 'undefined') return settled('none');

  const { origin, colors, seed, sound, ...rest } = options;
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

  const random = fxRandom(seed ?? Math.floor(Math.random() * 2 ** 32));
  let resolve = () => {};
  const drawn = new Promise<void>(r => {
    resolve = r;
  });
  let shaking: Animation | null = null;
  let rumble: Rumble | null = null;
  let run: Run;

  if (effect.kind === 'strike') {
    const plan = effect.strike(at, rest as Partial<Options>, random);
    run = { particles: [], strike: { plan, start: performance.now(), asked: 0 }, done: resolve };
    if (!start(run)) {
      resolve();
      return { motion, finished: drawn, stop() {} };
    }
    if (element && allowed.shake) shaking = shake(element, plan);
    if (sound && activated()) rumble = thunder(0.35);
  } else if (effect.kind === 'ambient') {
    const viewport = () => ({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
    const particles = effect.spawn(viewport(), { ...rest, ...(colors ? { colors } : {}) } as Partial<Options>, random)
      .slice(0, effect.budget);
    run = {
      particles, done: resolve,
      permitted: () => fxMotion({
        prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
        motionNone: scope.closest('[data-motion="none"]') !== null,
      }) === 'full',
      ambient: (current, dt) => stepAmbient(effect, current, viewport(), random, dt),
    };
    if (particles.length === 0 || !start(run)) {
      resolve();
      return { motion, finished: drawn, stop() {} };
    }
  } else {
    // Presets own their palette unless the caller explicitly supplies colors.
    const palette = colors ?? effect.colors ?? themeColors(scope);
    const particles = effect.spawn(
      at,
      { ...(rest as Partial<Options>), colors: palette.length > 0 ? palette : undefined },
      random,
    );
    run = { particles, done: resolve };
    if (particles.length === 0 || !start(run)) {
      resolve();
      return { motion, finished: drawn, stop() {} };
    }
  }

  return {
    motion,
    // Over when the drawing is over and the thunder has ended.
    finished: rumble ? Promise.all([drawn, rumble.ended]).then(() => {}) : drawn,
    stop() {
      shaking?.cancel();
      rumble?.stop();
      if (!runs.delete(run)) return;
      resolve();
      if (runs.size === 0) teardown();
    },
  };
}
