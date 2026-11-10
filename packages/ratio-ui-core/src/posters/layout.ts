// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { fitText, linesHeight, posterTypefaces, type PosterTypefaces } from './text';
import type {
  PosterContent,
  PosterImage,
  PosterLayer,
  PosterLayout,
  PosterTemplate,
  PosterTextSlot,
} from './types';

/** Common sizes, in pixels: what the social networks show without cropping. */
export const POSTER_SIZES = {
  /** 1:1, a feed post. */
  square: { width: 1080, height: 1080 },
  /** 4:5, the tallest a feed shows whole. */
  portrait: { width: 1080, height: 1350 },
  /** 9:16, a story or a reel. */
  story: { width: 1080, height: 1920 },
  /** 1.91:1, a link preview. */
  landscape: { width: 1200, height: 630 },
} as const;

const INK = '#1f2328';

/**
 * The share of a text box kept spare when breaking lines. Browsers draw a
 * line a little narrower than its table width (kerning) or, where glyphs
 * are hinted to whole pixels, up to a percent or two wider; the spare keeps
 * the wider case inside the box.
 */
export const POSTER_TEXT_SPARE = 0.02;

export interface LayoutOptions {
  /**
   * The theme's faces, by role: its `font`, for example `bureau.font`.
   * Default: the standard theme's, Source Serif 4 and Source Sans 3.
   */
  fonts?: { display: string; body: string };
  /** Faces of your own, measured your way. Wins over `fonts`. */
  typefaces?: PosterTypefaces;
}

/**
 * Lays a poster out: the template's slots filled with the content, every
 * text set at the largest size that fits its box. The result is plain data
 * in poster units, for any renderer to draw; it does no drawing itself.
 */
export function layoutPoster(
  template: PosterTemplate,
  content: PosterContent,
  options: LayoutOptions = {},
): PosterLayout {
  const faces = options.typefaces ?? posterTypefaces(options.fonts);
  const layers: PosterLayer[] = [
    {
      kind: 'rect',
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
      fill: template.background ?? '#ffffff',
    },
  ];
  const overflow: string[] = [];

  for (const [name, slot] of Object.entries(template.slots)) {
    const value = content[name];
    if (value === null || value === undefined) continue;
    if (slot.kind === 'image') {
      const image: PosterImage | undefined =
        typeof value === 'string' ? (value ? { src: value } : undefined) : value;
      if (!image?.src) continue;
      layers.push({
        kind: 'image',
        slot: name,
        href: image.src,
        alt: image.alt,
        ...slot.box,
        fit: slot.fit ?? 'contain',
      });
      continue;
    }
    if (typeof value !== 'string' || value.trim() === '') continue;
    const layer = setText(name, value, slot, template.color ?? INK, faces[slot.font ?? 'body']);
    if (layer.overflow) overflow.push(name);
    layers.push(layer);
  }

  if (template.frame) {
    const { width, color, inset = 0 } = template.frame;
    const offset = inset + width / 2;
    layers.push({
      kind: 'rect',
      x: offset,
      y: offset,
      width: template.width - offset * 2,
      height: template.height - offset * 2,
      stroke: color,
      strokeWidth: width,
    });
  }

  return { width: template.width, height: template.height, layers, overflow };
}

function setText(
  name: string,
  source: string,
  slot: PosterTextSlot,
  ink: string,
  typeface: PosterTypefaces['body'],
): PosterLayer & { kind: 'text' } {
  const lineHeight = slot.lineHeight ?? 1.15;
  const paragraphGap = slot.paragraphGap ?? 1;
  const { box } = slot;
  const fitted = fitText(
    slot.uppercase ? source.toLocaleUpperCase() : source,
    {
      width: box.width * (1 - POSTER_TEXT_SPARE),
      height: box.height,
      size: slot.size,
      weight: slot.weight ?? 'bold',
      letterSpacing: slot.letterSpacing ?? 0,
      lineHeight,
      paragraphGap,
      maxLines: slot.maxLines,
    },
    typeface.measure,
  );
  const { size } = fitted.font;
  const block = linesHeight(fitted.lines, size, lineHeight, paragraphGap);
  const valign = slot.valign ?? 'top';
  const top =
    valign === 'top'
      ? box.y
      : valign === 'bottom'
        ? box.y + box.height - block
        : box.y + (box.height - block) / 2;
  const align = slot.align ?? 'start';
  const x = align === 'start' ? box.x : align === 'end' ? box.x + box.width : box.x + box.width / 2;
  // The glyphs sit centred in each line box, as CSS places them.
  const lineBox = size * lineHeight;
  const baseline = (lineBox - (typeface.ascent + typeface.descent) * size) / 2 + typeface.ascent * size;

  let y = top;
  const lines = [];
  for (const line of fitted.lines) {
    if (line.gap) {
      y += lineBox * paragraphGap;
      continue;
    }
    lines.push({ text: line.text, x, y: y + baseline });
    y += lineBox;
  }

  return {
    kind: 'text',
    slot: name,
    source,
    lines,
    family: typeface.family,
    font: fitted.font,
    color: slot.color ?? ink,
    anchor: align === 'start' ? 'start' : align === 'end' ? 'end' : 'middle',
    overflow: fitted.overflow,
  };
}
