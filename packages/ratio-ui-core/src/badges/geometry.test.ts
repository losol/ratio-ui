// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { BADGE_LAYOUT, badgeOutline, captionFontSize, symbolFontSize } from './geometry';
import type { BadgeShape } from './types';

const SHAPES: BadgeShape[] = ['circle', 'shield', 'hexagon', 'rosette'];

describe('badgeOutline', () => {
  it('is a closed path for every shape', () => {
    for (const shape of SHAPES) {
      const d = badgeOutline(shape);
      expect(d).toMatch(/^M[\d.]+ [\d.]+ /);
      expect(d).toMatch(/ Z$/);
    }
  });

  it('starts at the top centre and scales about the centre', () => {
    expect(badgeOutline('circle')).toMatch(/^M50\.00 4\.00 /);
    expect(badgeOutline('circle', 0.5)).toMatch(/^M50\.00 27\.00 /);
    expect(badgeOutline('shield', BADGE_LAYOUT.ringScale)).toMatch(/^M50\.00 11\.36 /);
  });

  it('draws the rosette as twelve arcs', () => {
    expect(badgeOutline('rosette').match(/ A/g)).toHaveLength(12);
  });

  it('is the same string every time, so two renderers draw the same medallion', () => {
    expect(badgeOutline('hexagon')).toBe(badgeOutline('hexagon'));
  });
});

describe('type sizes', () => {
  it('shrink the symbol as it gets longer, and the caption past six characters', () => {
    expect(symbolFontSize('×')).toBeGreaterThan(symbolFontSize('10'));
    expect(symbolFontSize('10')).toBeGreaterThan(symbolFontSize('ABC'));
    expect(captionFontSize('Times')).toBeGreaterThan(captionFontSize('10 books'));
  });
});
