// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { formatColor, oklchToRgba, parseColor } from './color';

describe('parseColor', () => {
  it('reads hex in every length', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('#20304d')).toEqual({ r: 32, g: 48, b: 77, a: 1 });
    expect(parseColor('#20304d80').a).toBeCloseTo(0.502, 2);
  });

  it('reads rgb() with commas and with slashes', () => {
    expect(parseColor('rgba(255, 110, 82, 0.18)')).toEqual({ r: 255, g: 110, b: 82, a: 0.18 });
    expect(parseColor('rgb(0 0 0 / 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(parseColor('rgb(32 36 44)')).toEqual({ r: 32, g: 36, b: 44, a: 1 });
  });

  it('reads oklch()', () => {
    expect(parseColor('oklch(1 0 0)')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('oklch(0 0 0)')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseColor('oklch(50% 0 0 / 0.5)').a).toBe(0.5);
  });

  it('refuses what it cannot read, loudly', () => {
    expect(() => parseColor('hsl(0 0% 0%)')).toThrow(/Unsupported colour/);
    expect(() => parseColor('color-mix(in srgb, red, blue)')).toThrow(/Unsupported colour/);
    expect(() => parseColor('rgb(a b c)')).toThrow(/Unexpected channel/);
  });
});

describe('oklchToRgba', () => {
  it('lands sRGB red on the nose', () => {
    // sRGB red, as OKLCH writes it.
    expect(oklchToRgba(0.627955, 0.257683, 29.2339)).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('clips what sRGB cannot show instead of wrapping', () => {
    const { r, g, b } = oklchToRgba(0.9, 0.4, 145);
    for (const c of [r, g, b]) expect(c).toBeGreaterThanOrEqual(0);
    for (const c of [r, g, b]) expect(c).toBeLessThanOrEqual(255);
  });
});

describe('formatColor', () => {
  it('writes hex when opaque and rgba otherwise', () => {
    expect(formatColor({ r: 32, g: 48, b: 77, a: 1 })).toBe('#20304d');
    expect(formatColor({ r: 32, g: 36, b: 44, a: 0.62 })).toBe('rgba(32, 36, 44, 0.62)');
    expect(formatColor({ r: 0, g: 0, b: 0, a: 1 / 3 })).toBe('rgba(0, 0, 0, 0.333)');
  });
});
