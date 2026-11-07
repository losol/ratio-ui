// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import {
  CHART_PALETTE,
  chartColorKey,
  bandScale,
  linearScale,
  niceStep,
  niceTicks,
  numberFormatter,
  stackSeries,
  valueExtent,
} from './index';

describe('niceTicks', () => {
  it('lands on nice numbers and widens the domain to whole steps', () => {
    expect(niceTicks(0, 0.95, 4)).toEqual({ min: 0, max: 1, step: 0.25, ticks: [0, 0.25, 0.5, 0.75, 1] });
    expect(niceTicks(0, 0.95, 2).ticks).toEqual([0, 0.5, 1]);
    expect(niceTicks(3, 97).ticks).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('spans negative values and leaves no floating-point dust', () => {
    const { ticks } = niceTicks(-0.3, 0.7, 5);
    expect(ticks).toEqual([-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8]);
    expect(niceTicks(0, 0.3, 3).ticks).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it('opens an empty domain to one that holds the value and zero', () => {
    expect(niceTicks(0, 0).ticks).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceTicks(4, 4).min).toBe(0);
    expect(niceTicks(-4, -4).max).toBe(0);
    expect(niceTicks(Number.NaN, 1).ticks.length).toBeGreaterThan(1);
  });

  it('picks steps of 1, 2, 2.5 and 5', () => {
    expect(niceStep(10, 10)).toBe(1);
    expect(niceStep(10, 5)).toBe(2);
    expect(niceStep(10, 4)).toBe(2.5);
    expect(niceStep(10, 2)).toBe(5);
    expect(niceStep(0)).toBe(1);
  });
});

describe('linearScale', () => {
  it('maps the domain to 0–1 and back', () => {
    const y = linearScale([-0.5, 1]);
    expect(y(-0.5)).toBe(0);
    expect(y(1)).toBe(1);
    expect(y(0)).toBeCloseTo(1 / 3);
    expect(y.invert(y(0.25))).toBeCloseTo(0.25);
  });

  it('survives an empty domain', () => {
    expect(linearScale([2, 2])(2)).toBe(0);
  });
});

describe('bandScale', () => {
  it('fills 0–1 with equal bands and padding', () => {
    const x = bandScale(4, { paddingInner: 0.2, paddingOuter: 0.1 });
    expect(x.start(0)).toBeCloseTo(x.step * 0.1);
    expect(x.start(3) + x.bandwidth + x.step * 0.1).toBeCloseTo(1);
    expect(x.center(1) - x.center(0)).toBeCloseTo(x.step);
    expect(x.bandwidth).toBeCloseTo(x.step * 0.8);
  });

  it('has no bands for no categories', () => {
    expect(bandScale(0).bandwidth).toBe(0);
  });
});

describe('stackSeries', () => {
  const rows = [
    { hour: '00', wind: 0.1, water: 0.2, sun: 0 },
    { hour: '12', wind: 0.4, water: -0.1, sun: 0.15 },
    { hour: '13', wind: 0.3 },
  ];

  it('stacks positives up and negatives down from zero, in order', () => {
    const [wind, water, sun] = stackSeries(rows, ['wind', 'water', 'sun']);
    expect(wind![0]).toEqual([0, 0.1]);
    expect(water![0]![0]).toBeCloseTo(0.1);
    expect(water![0]![1]).toBeCloseTo(0.3);
    expect(water![1]).toEqual([-0.1, 0]);
    expect(sun![1]![0]).toBeCloseTo(0.4);
    expect(sun![1]![1]).toBeCloseTo(0.55);
  });

  it('gives a missing value an empty segment where the stack stands', () => {
    const [, water, sun] = stackSeries(rows, ['wind', 'water', 'sun']);
    expect(water![2]).toEqual([0.3, 0.3]);
    expect(sun![2]).toEqual([0.3, 0.3]);
  });

  it('measures the extent of stacks and single series, zero included', () => {
    const [lo, hi] = valueExtent(rows, [['wind', 'water', 'sun']], ['use']);
    expect(lo).toBeCloseTo(-0.1);
    expect(hi).toBeCloseTo(0.55);
    expect(valueExtent([{ use: 2 }, { use: 5 }], [], ['use'])).toEqual([0, 5]);
  });
});

describe('numberFormatter', () => {
  it('writes the axis step\'s decimals on every tick, in the locale', () => {
    const f = numberFormatter({ locale: 'nb' }, 0.25);
    expect([0, 0.5, 1].map(f)).toEqual(['0,00', '0,50', '1,00']);
    expect(numberFormatter({ locale: 'en' }, 0.5)(1)).toBe('1.0');
    expect(numberFormatter({ locale: 'en' }, 20)(40)).toBe('40');
  });

  it('writes at most two decimals without a step, and lets explicit digits win', () => {
    expect(numberFormatter({ locale: 'nb' })(0.95)).toBe('0,95');
    expect(numberFormatter({ locale: 'en' })(1 / 3)).toBe('0.33');
    expect(numberFormatter({ locale: 'en', maximumFractionDigits: 0 }, 0.25)(0.75)).toBe('1');
  });

  it('never writes minus zero', () => {
    expect(numberFormatter({ locale: 'en' }, 0.5)(-0)).toBe('0.0');
  });
});

describe('the palette', () => {
  it('is six theme colours, wrapping after the sixth', () => {
    expect(CHART_PALETTE).toHaveLength(6);
    expect(chartColorKey(0)).toBe('primary');
    expect(chartColorKey(3)).toBe('text');
    expect(chartColorKey(6)).toBe('primary');
    expect(chartColorKey(-1)).toBe('warningSolid');
  });
});
