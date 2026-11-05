import { describe, expect, it } from 'vitest';
import { snow, rain, stepAmbient, fxRandom, nationalDay, newYear, winter, particleOpacity } from './index';

const viewport = { x: 0, y: 0, width: 800, height: 600 };

describe.each([snow, rain, winter])('$name ambient model', effect => {
  it('is deterministic and scales a finite live budget', () => {
    const spawn = (intensity: number) => effect.spawn(viewport, { intensity }, fxRandom(23));
    expect(spawn(0.4)).toEqual(spawn(0.4));
    expect(spawn(0)).toEqual([]);
    expect(spawn(-1)).toEqual([]);
    expect(spawn(NaN)).toEqual([]);
    expect(spawn(Infinity)).toEqual([]);
    expect(spawn(9)).toHaveLength(effect.budget);
    expect(spawn(0.4)).toHaveLength(Math.round(effect.budget * 0.4));
  });

  it('recycles indefinitely without growing or mutating the input', () => {
    const initial = effect.spawn(viewport, { intensity: 1, wind: 500 }, fxRandom(5));
    const copy = structuredClone(initial);
    let particles = initial;
    const random = fxRandom(2);
    for (let i = 0; i < 4000; i++) particles = stepAmbient(effect, particles, viewport, random, 0.05);
    expect(initial).toEqual(copy);
    expect(particles).toHaveLength(effect.budget);
    expect(particles).not.toEqual(initial);
    expect(particles.every(p => p.y <= 620 && Number.isFinite(p.x) && particleOpacity(p) === 1)).toBe(true);
  });

  it('re-enters at the top after resize and caps long steps', () => {
    const p = effect.spawn(viewport, { intensity: 0.1 }, fxRandom(1))[0]!;
    const smaller = { x: 10, y: 20, width: 30, height: 40 };
    const recycled = stepAmbient(effect, [{ ...p, y: 900 }], smaller, fxRandom(2), 0.05)[0]!;
    expect(recycled.y).toBe(20 - p.size);
    expect(recycled.x).toBeGreaterThanOrEqual(10);
    expect(recycled.x).toBeLessThanOrEqual(40);
    expect(stepAmbient(effect, [p], viewport, fxRandom(2), 99))
      .toEqual(stepAmbient(effect, [p], viewport, fxRandom(2), 0.05));
  });
});

it('presets retain effect kind and budget, accept overrides, and never add sound or flashes', () => {
  expect(nationalDay.kind).toBe('burst');
  expect(newYear.kind).toBe('burst');
  expect(winter.kind).toBe('ambient');
  expect(winter.spawn(viewport, {}, fxRandom(1))).toHaveLength(30);
  for (const effect of [nationalDay, newYear]) {
    const particles = effect.spawn({ x: 400, y: 600 }, { colors: ['#123456'] }, fxRandom(1));
    expect(particles.length).toBeLessThanOrEqual(effect.budget);
    expect(particles.every(p => p.shell ? p.shell.colors.includes('#123456') : p.color === '#123456')).toBe(true);
  }
});

it('occasion defaults preserve their underlying counts and palettes', () => {
  const pieces = nationalDay.spawn({ x: 400, y: 600 }, {}, fxRandom(1));
  expect(pieces).toHaveLength(120);
  expect(new Set(pieces.map(p => p.color))).toEqual(new Set(['#ba0c2f', '#ffffff', '#00205b']));
  expect(newYear.spawn({ x: 400, y: 600 }, {}, fxRandom(1))).toHaveLength(4);
  expect(nationalDay.spawn({ x: 0, y: 0 }, { count: 3 }, fxRandom(1))).toHaveLength(3);
  expect(newYear.spawn({ x: 0, y: 0 }, { rockets: 2 }, fxRandom(1))).toHaveLength(2);
});

it('weather has distinct steady shapes, finite wind and caller colors', () => {
  for (const effect of [snow, rain]) {
    const particles = effect.spawn(viewport, { wind: NaN, colors: ['#123456'] }, fxRandom(1));
    expect(particles.every(p => p.color === '#123456' && p.vx === 0 && p.twinkle === 0)).toBe(true);
    expect(particles.every(p => p.shape === (effect === snow ? 'circle' : 'line'))).toBe(true);
  }
});
