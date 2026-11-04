// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { BADGE_TIER_COLORS } from '../badges/types';
import {
  FX_DEFAULT_COLORS,
  FX_FLASH,
  FX_MAX_STEP,
  admitFlash,
  centerOf,
  confetti,
  flashOpacity,
  fxAllowance,
  fxMotion,
  fxRandom,
  particleOpacity,
  resolveFxColors,
  sparkles,
  stepParticles,
  tierPalette,
  type FxParticle,
} from './index';

const particle = (over: Partial<FxParticle> = {}): FxParticle => ({
  x: 0,
  y: 0,
  vx: 100,
  vy: -200,
  gravity: 1000,
  drag: 0.5,
  rotation: 0,
  spin: 2,
  flip: 0,
  flipSpeed: 4,
  size: 8,
  color: '#000000',
  shape: 'rect',
  age: 0,
  life: 2,
  twinkle: 0,
  ...over,
});

/** Run a burst until its last particle dies, or give up after `seconds`. */
const simulate = (ps: FxParticle[], seconds: number) => {
  let t = 0;
  let current = ps;
  while (current.length > 0 && t < seconds) {
    current = stepParticles(current, 1 / 60);
    t += 1 / 60;
  }
  return { left: current, elapsed: t };
};

describe('fxRandom', () => {
  it('gives the same numbers for the same seed, and others for another', () => {
    const a = fxRandom(42);
    const b = fxRandom(42);
    const c = fxRandom(43);
    const seqA = Array.from({ length: 5 }, () => a.next());
    expect(Array.from({ length: 5 }, () => b.next())).toEqual(seqA);
    expect(Array.from({ length: 5 }, () => c.next())).not.toEqual(seqA);
  });

  it('stays in range and picks every item about as often', () => {
    const r = fxRandom(7);
    const counts = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 3000; i++) {
      const v = r.range(-2, 5);
      expect(v).toBeGreaterThanOrEqual(-2);
      expect(v).toBeLessThan(5);
      counts[r.pick(['a', 'b', 'c'] as const)]++;
    }
    for (const n of Object.values(counts)) expect(n).toBeGreaterThan(850);
  });

  it('refuses to pick from nothing', () => {
    expect(() => fxRandom(1).pick([])).toThrow();
  });
});

describe('stepParticles', () => {
  it('applies drag, then gravity, then moves', () => {
    const [p] = stepParticles([particle()], 0.05);
    const keep = Math.pow(0.5, 0.05);
    expect(p!.vx).toBeCloseTo(100 * keep);
    expect(p!.vy).toBeCloseTo(-200 * keep + 1000 * 0.05);
    expect(p!.x).toBeCloseTo(p!.vx * 0.05);
    expect(p!.y).toBeCloseTo(p!.vy * 0.05);
    expect(p!.rotation).toBeCloseTo(0.1);
    expect(p!.flip).toBeCloseTo(0.2);
    expect(p!.age).toBeCloseTo(0.05);
  });

  it('never takes a longer step than FX_MAX_STEP, nor a negative one', () => {
    const [long] = stepParticles([particle()], 60);
    expect(long!.age).toBeCloseTo(FX_MAX_STEP);
    const [back] = stepParticles([particle()], -1);
    expect(back!.age).toBe(0);
  });

  it('drops particles whose life is over and leaves the input alone', () => {
    const input = [particle({ age: 1.99 }), particle()];
    const next = stepParticles(input, 0.02);
    expect(next).toHaveLength(1);
    expect(input[0]!.age).toBe(1.99);
  });
});

describe('particleOpacity', () => {
  it('is steady, then fades over the last part of its life', () => {
    expect(particleOpacity(particle({ age: 0.5 }))).toBe(1);
    expect(particleOpacity(particle({ age: 1.7 }))).toBeCloseTo(0.5);
    expect(particleOpacity(particle({ age: 2 }))).toBe(0);
  });

  it('flickers between 0.1 and 1 when it twinkles', () => {
    for (let age = 0; age < 1; age += 0.013) {
      const o = particleOpacity(particle({ age, twinkle: 8 }));
      expect(o).toBeGreaterThanOrEqual(0.1 - 1e-9);
      expect(o).toBeLessThanOrEqual(1);
    }
  });
});

describe('centerOf', () => {
  it('is the point itself, or the middle of a box', () => {
    expect(centerOf({ x: 3, y: 4 })).toEqual({ x: 3, y: 4 });
    expect(centerOf({ x: 10, y: 20, width: 100, height: 40 })).toEqual({ x: 60, y: 40 });
  });
});

describe('confetti', () => {
  const origin = { x: 400, y: 600 };

  it('throws 90 pieces up from the origin by default', () => {
    const ps = confetti.spawn(origin, {}, fxRandom(1));
    expect(ps).toHaveLength(90);
    for (const p of ps) {
      expect(p.x).toBe(400);
      expect(p.y).toBe(600);
      const deg = (Math.atan2(-p.vy, p.vx) * 180) / Math.PI;
      expect(deg).toBeGreaterThanOrEqual(55 - 1e-9);
      expect(deg).toBeLessThanOrEqual(125 + 1e-9);
      const speed = Math.hypot(p.vx, p.vy);
      expect(speed).toBeGreaterThanOrEqual(1100 * 0.7 - 1e-6);
      expect(speed).toBeLessThanOrEqual(1100 * 1.3 + 1e-6);
      expect(FX_DEFAULT_COLORS).toContain(p.color);
    }
  });

  it('is the same salvo for the same seed', () => {
    expect(confetti.spawn(origin, {}, fxRandom(9))).toEqual(confetti.spawn(origin, {}, fxRandom(9)));
  });

  it('never asks for more than its budget', () => {
    expect(confetti.spawn(origin, { count: 5000 }, fxRandom(1))).toHaveLength(confetti.budget);
    expect(confetti.spawn(origin, { count: -3 }, fxRandom(1))).toHaveLength(0);
  });

  it('starts from the middle of an element and throws in its tier colours', () => {
    const ps = confetti.spawn({ x: 0, y: 0, width: 80, height: 40 }, { colors: 'tier:gold' }, fxRandom(2));
    expect(ps[0]).toMatchObject({ x: 40, y: 20 });
    const gold = tierPalette('gold');
    for (const p of ps) expect(gold).toContain(p.color);
  });

  it('is over within a few seconds', () => {
    const { left, elapsed } = simulate(confetti.spawn(origin, {}, fxRandom(3)), 10);
    expect(left).toHaveLength(0);
    expect(elapsed).toBeLessThanOrEqual(3.5);
  });
});

describe('sparkles', () => {
  const box = { x: 100, y: 100, width: 60, height: 60 };

  it('rings the element with twinkling stars that drift outward', () => {
    const ps = sparkles.spawn(box, {}, fxRandom(4));
    expect(ps).toHaveLength(18);
    for (const p of ps) {
      expect(p.shape).toBe('star');
      expect(p.twinkle).toBeGreaterThan(0);
      const dx = p.x - 130;
      const dy = p.y - 130;
      // On the ring 12px outside the 60px box: radius 42.
      expect(Math.hypot(dx, dy)).toBeCloseTo(42, 6);
      expect(dx * p.vx + dy * p.vy).toBeGreaterThan(0);
    }
  });

  it('is over in about a second, and stays within its budget', () => {
    const { left, elapsed } = simulate(sparkles.spawn(box, {}, fxRandom(5)), 5);
    expect(left).toHaveLength(0);
    expect(elapsed).toBeLessThanOrEqual(1.2);
    expect(sparkles.spawn(box, { count: 999 }, fxRandom(5))).toHaveLength(sparkles.budget);
  });
});

describe('colours', () => {
  it('gives a tier its metal, a highlight and a shadow', () => {
    const [base, light, dark] = tierPalette('gold');
    expect(base).toBe(BADGE_TIER_COLORS.gold);
    expect(light).not.toBe(base);
    expect(dark).not.toBe(base);
  });

  it('falls back to the default, and refuses a tier it does not know', () => {
    expect(resolveFxColors()).toBe(FX_DEFAULT_COLORS);
    expect(resolveFxColors([])).toBe(FX_DEFAULT_COLORS);
    expect(resolveFxColors(['#fff'])).toEqual(['#fff']);
    expect(() => resolveFxColors('tier:platinum' as never)).toThrow();
  });
});

describe('motion', () => {
  it('lets the page switch win over the reader setting', () => {
    expect(fxMotion({ prefersReducedMotion: false, motionNone: false })).toBe('full');
    expect(fxMotion({ prefersReducedMotion: true, motionNone: false })).toBe('reduced');
    expect(fxMotion({ prefersReducedMotion: false, motionNone: true })).toBe('none');
    expect(fxMotion({ prefersReducedMotion: true, motionNone: true })).toBe('none');
  });

  it('moves only under full motion, and is fully still under none', () => {
    expect(fxAllowance('full')).toEqual({ particles: true, flash: true, shake: true, fallback: false });
    expect(fxAllowance('reduced')).toEqual({ particles: false, flash: false, shake: false, fallback: true });
    expect(fxAllowance('none')).toEqual({ particles: false, flash: false, shake: false, fallback: false });
  });
});

describe('the flash cap', () => {
  it('allows three flashes in a second and refuses the fourth', () => {
    let history: number[] = [];
    const starts = [0, 100, 200, 300];
    const allowed = starts.map(t => {
      const d = admitFlash(history, t);
      history = d.history;
      return d.allowed;
    });
    expect(allowed).toEqual([true, true, true, false]);
    expect(FX_FLASH.perSecond).toBe(3);
  });

  it('allows again once the oldest flash is a second behind', () => {
    const history = [0, 100, 200];
    expect(admitFlash(history, 999).allowed).toBe(false);
    const later = admitFlash(history, 1000);
    expect(later.allowed).toBe(true);
    expect(later.history).toEqual([100, 200, 1000]);
  });

  it('never lets a flash past the opacity cap', () => {
    expect(flashOpacity(1)).toBe(FX_FLASH.maxOpacity);
    expect(flashOpacity(0.2)).toBe(0.2);
    expect(flashOpacity(-1)).toBe(0);
  });
});
