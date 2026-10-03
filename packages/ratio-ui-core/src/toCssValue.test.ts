// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { expect, it } from 'vitest';
import { mix } from './theme';
import { toCssValue } from './toCssValue';

it('writes a colour string as itself', () => {
  expect(toCssValue('#20304d')).toBe('#20304d');
  expect(toCssValue('oklch(0.6 0.16 270)')).toBe('oklch(0.6 0.16 270)');
});

it('writes a mix as color-mix over the referenced token', () => {
  expect(toCssValue(mix('text', 0.62))).toBe('color-mix(in srgb, var(--text) 62%, transparent)');
  expect(toCssValue(mix('surface', 0.88, 'oklch'))).toBe(
    'color-mix(in oklch, var(--surface) 88%, transparent)',
  );
});

it('writes a shadow in CSS order with a unitless zero', () => {
  expect(toCssValue({ x: 2, y: 2, blur: 0, color: mix('text', 0.62) })).toBe(
    '2px 2px 0 color-mix(in srgb, var(--text) 62%, transparent)',
  );
  expect(toCssValue({ x: 0, y: 4, blur: 12, color: '#000' })).toBe('0 4px 12px #000');
});

it('writes a number in px', () => {
  expect(toCssValue(3)).toBe('3px');
  expect(toCssValue(0)).toBe('0');
});
