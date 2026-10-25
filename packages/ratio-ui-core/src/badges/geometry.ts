// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The medallion's geometry, shared by every renderer so a rosette on the
// web is the rosette in the app and on the baked file: one 100-unit box,
// the outline as an SVG path, and where the parts sit in it.

import type { BadgeShape } from './types';

/** The art's box: `0 0 100 100`, whatever size it is drawn at. */
export const BADGE_BOX = 100;

/** Where the parts of the medallion sit, in the box's units. */
export const BADGE_LAYOUT = {
  /** The tier ring is the outline again, scaled in by this. */
  ringScale: 0.84,
  /** The tier ring's stroke. */
  ringWidth: 2.5,
  /** Radius of the progress arc, just inside the box. */
  rimRadius: 48,
  /** The progress arc's stroke. */
  rimWidth: 3,
  /** The emblem's box (a 24-unit glyph scaled into it), centred on the glyph line. */
  emblemSize: 42,
  /** The centre line of the glyph with and without a caption under it. */
  glyphY: { withCaption: 41, alone: 50 },
  /** The caption's centre line. */
  captionY: 72,
} as const;

/** The symbol's size by how many characters it is. */
export const symbolFontSize = (symbol: string): number =>
  symbol.length > 2 ? 26 : symbol.length > 1 ? 34 : 42;

/** The caption's size: a long word goes a step smaller to fit. */
export const captionFontSize = (caption: string): number => (caption.length > 6 ? 10 : 12);

/**
 * The outline as an SVG path, centred in the box and scaled about its
 * centre: `1` is the medallion's edge, `BADGE_LAYOUT.ringScale` the tier
 * ring inside it.
 */
export function badgeOutline(shape: BadgeShape, scale = 1): string {
  const c = BADGE_BOX / 2;
  const s = scale;
  const p = (x: number, y: number) => `${(c + x * s).toFixed(2)} ${(c + y * s).toFixed(2)}`;
  switch (shape) {
    case 'circle': {
      const r = (46 * s).toFixed(2);
      return `M${p(0, -46)} A${r} ${r} 0 1 1 ${p(0, 46)} A${r} ${r} 0 1 1 ${p(0, -46)} Z`;
    }
    case 'hexagon': {
      const r = 47;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return p(r * Math.cos(a), r * Math.sin(a));
      });
      return `M${pts.join(' L')} Z`;
    }
    case 'shield': {
      return (
        `M${p(0, -46)} L${p(40, -34)} L${p(40, -2)} ` +
        `C${p(40, 22)} ${p(22, 40)} ${p(0, 46)} ` +
        `C${p(-22, 40)} ${p(-40, 22)} ${p(-40, -2)} ` +
        `L${p(-40, -34)} Z`
      );
    }
    case 'rosette': {
      const n = 12;
      const r = 43;
      const pts = Array.from({ length: n }, (_, i) => {
        const a = (2 * Math.PI * i) / n - Math.PI / 2;
        return [r * Math.cos(a), r * Math.sin(a)] as const;
      });
      const chord = 2 * r * Math.sin(Math.PI / n);
      const bulge = (chord * 0.62 * s).toFixed(2);
      let d = `M${p(...pts[0]!)}`;
      for (let i = 1; i <= n; i++) {
        const [x, y] = pts[i % n]!;
        d += ` A${bulge} ${bulge} 0 0 1 ${p(x, y)}`;
      }
      return `${d} Z`;
    }
  }
}
