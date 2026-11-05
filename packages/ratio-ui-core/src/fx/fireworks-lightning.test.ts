// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import {
  fireworks,
  fxRandom,
  lightning,
  particleOpacity,
  shakeOffset,
  stepParticles,
  type FxParticle,
} from './index';

const tick = 1 / 60;

/** Step until `seconds` have passed; returns every frame's particles. */
const run = (start: FxParticle[], seconds: number) => {
  const frames: FxParticle[][] = [start];
  let current = start;
  for (let t = 0; t < seconds; t += tick) {
    current = stepParticles(current, tick);
    frames.push(current);
  }
  return frames;
};

describe('the physics: waiting and bursting', () => {
  const rocket = (over: Partial<FxParticle> = {}): FxParticle => ({
    x: 0, y: 500, vx: 0, vy: -400, gravity: 0, drag: 1, rotation: 0, spin: 0, flip: 0, flipSpeed: 0,
    size: 4, color: '#fff', shape: 'circle', age: 0, life: 0.5, twinkle: 0, ...over,
  });

  it('holds a particle with a negative age still and invisible until it starts', () => {
    const waiting = rocket({ age: -0.3 });
    expect(particleOpacity(waiting)).toBe(0);
    const [later] = stepParticles([waiting], 0.05);
    expect(later!.y).toBe(500);
    expect(later!.age).toBeCloseTo(-0.25);
    const [started] = stepParticles([rocket({ age: -0.01 })], 0.05);
    expect(started!.age).toBe(0);
  });

  it('bursts a shell into its sparks where the rocket ends, the same each time', () => {
    const shell = { count: 40, speed: 300, colors: ['#ff0000', '#00ff00'], life: 1.2, seed: 77 };
    const before = [rocket({ age: 0.49, shell })];
    const after = stepParticles(before, 0.02);
    expect(after).toHaveLength(40);
    for (const s of after) {
      expect(s.x).toBe(0);
      expect(s.y).toBeCloseTo(500, 0);
      expect(['#ff0000', '#00ff00']).toContain(s.color);
      expect(Math.hypot(s.vx, s.vy)).toBeLessThanOrEqual(300 + 1e-6);
      expect(s.shell).toBeUndefined();
    }
    expect(stepParticles(before, 0.02)).toEqual(after);
  });
});

describe('fireworks', () => {
  const ground = { x: 400, y: 600 };

  it('launches its rockets one after another from the origin', () => {
    const rockets = fireworks.spawn(ground, { rockets: 4, interval: 0.3 }, fxRandom(1));
    expect(rockets).toHaveLength(4);
    [0, -0.3, -0.6, -0.9].forEach((age, i) => expect(rockets[i]!.age).toBeCloseTo(age));
    for (const r of rockets) {
      expect(r.x).toBe(400);
      expect(r.y).toBe(600);
      expect(r.vy).toBeLessThan(0);
      expect(r.shell?.count).toBe(60);
    }
  });

  it('rises from the top of an element, not through it', () => {
    const [r] = fireworks.spawn({ x: 100, y: 300, width: 200, height: 50 }, { rockets: 1 }, fxRandom(2));
    expect(r).toMatchObject({ x: 200, y: 300 });
  });

  it('bursts each rocket near its height, within the width, and is over in a few seconds', () => {
    const rockets = fireworks.spawn(ground, { height: 360, width: 320 }, fxRandom(3));
    const frames = run(rockets, 6);
    const sparks = frames.find(f => f.length > rockets.length)!;
    const burstAt = sparks.filter(p => !p.shell)[0]!;
    expect(600 - burstAt.y).toBeGreaterThan(360 * 0.75 - 10);
    expect(600 - burstAt.y).toBeLessThanOrEqual(360 + 10);
    expect(Math.abs(burstAt.x - 400)).toBeLessThanOrEqual(160 + 1);
    expect(frames.at(-1)).toHaveLength(0);
  });

  it('never spawns more than its budget, sparks included', () => {
    const rockets = fireworks.spawn(ground, { rockets: 50, sparks: 999 }, fxRandom(4));
    expect(rockets).toHaveLength(6);
    const total = rockets.length + rockets.reduce((n, r) => n + (r.shell?.count ?? 0), 0);
    expect(total).toBeLessThanOrEqual(fireworks.budget);
    expect(() => {
      (fireworks as { budget: number }).budget = 1e6;
    }).toThrow(TypeError);
  });
});

describe('lightning', () => {
  const target = { x: 300, y: 400, width: 120, height: 60 };

  it('runs from the sky to the top of the target', () => {
    const plan = lightning.strike(target, {}, fxRandom(5));
    const [main] = plan.bolts;
    expect(main!.branch).toBe(false);
    expect(main!.points).toHaveLength(65);
    expect(main!.points[0]!.y).toBe(0);
    expect(main!.points.at(-1)).toEqual({ x: 360, y: 400 });
  });

  it('can start from a given point, and keeps its branches thinner', () => {
    const plan = lightning.strike(target, { from: { x: 10, y: 20 }, branches: 3 }, fxRandom(6));
    expect(plan.bolts[0]!.points[0]).toEqual({ x: 10, y: 20 });
    const branches = plan.bolts.filter(b => b.branch);
    expect(branches).toHaveLength(3);
    for (const b of branches) expect(b.width).toBeLessThan(plan.bolts[0]!.width);
    expect(lightning.strike(target, { branches: 99 }, fxRandom(6)).bolts.filter(b => b.branch)).toHaveLength(4);
  });

  it('plans at most two flashes, well inside the cap, and is the same for the same seed', () => {
    expect(lightning.strike(target, {}, fxRandom(7)).flashes).toEqual([0, 140]);
    expect(lightning.strike(target, { restrike: false }, fxRandom(7)).flashes).toEqual([0]);
    expect(lightning.strike(target, {}, fxRandom(8))).toEqual(lightning.strike(target, {}, fxRandom(8)));
  });

  it('shakes only when asked, and never more than 12 px', () => {
    expect(lightning.strike(target, {}, fxRandom(9)).shake).toBe(0);
    expect(lightning.strike(target, { shake: 8 }, fxRandom(9)).shake).toBe(8);
    expect(lightning.strike(target, { shake: 400 }, fxRandom(9)).shake).toBe(12);
    expect(() => {
      (lightning as { name: string }).name = 'other';
    }).toThrow(TypeError);
  });
});

describe('shakeOffset', () => {
  it('dies away, is still outside its time, and is the same for the same seed', () => {
    expect(shakeOffset(-1, 400, 8, 1)).toEqual({ x: 0, y: 0 });
    expect(shakeOffset(400, 400, 8, 1)).toEqual({ x: 0, y: 0 });
    expect(shakeOffset(100, 400, 0, 1)).toEqual({ x: 0, y: 0 });
    for (let t = 0; t < 400; t += 7) {
      const { x, y } = shakeOffset(t, 400, 8, 1);
      const room = 8 * (1 - t / 400) + 1e-9;
      expect(Math.abs(x)).toBeLessThanOrEqual(room);
      expect(Math.abs(y)).toBeLessThanOrEqual(room);
    }
    expect(shakeOffset(123, 400, 8, 42)).toEqual(shakeOffset(123, 400, 8, 42));
  });
});
