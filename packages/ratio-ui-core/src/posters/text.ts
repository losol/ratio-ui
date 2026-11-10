// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Setting text in a box: break it into lines that fit the width, and find
// the largest size at which the lines fit the height. Pure arithmetic over a
// measure, so it gives the same lines on the server and in the browser.

import { POSTER_CHARS, POSTER_FACES, type FaceMetrics } from './metrics';
import type { MeasureText, PosterFont, PosterTypeface } from './types';

/**
 * A measure from a table of advance widths, in thousandths of an em, one per
 * character of `chars`. A character the table lacks is measured at the
 * table's average width.
 */
export function tableMeasure(
  chars: string,
  widths: { regular: readonly number[]; bold: readonly number[] },
): MeasureText {
  const tables = {
    regular: tableOf(chars, widths.regular),
    bold: tableOf(chars, widths.bold),
  };
  return (text, font) => {
    const { map, average } = tables[font.weight];
    let units = 0;
    let count = 0;
    for (const char of text) {
      units += map.get(char) ?? average;
      count += 1;
    }
    return (units / 1000 + font.letterSpacing * count) * font.size;
  };
}

function tableOf(chars: string, widths: readonly number[]) {
  const map = new Map<string, number>();
  Array.from(chars).forEach((char, i) => {
    const width = widths[i];
    if (width !== undefined) map.set(char, width);
  });
  const all = [...map.values()];
  const average = all.reduce((sum, width) => sum + width, 0) / Math.max(all.length, 1);
  return { map, average };
}

/** The standard theme's faces, as `tokens/typography.css` names them. */
export const POSTER_STANDARD_FONTS = { display: 'Source Serif 4', body: 'Source Sans 3' } as const;

const typefaces = new Map<string, PosterTypeface>();

/**
 * The typeface for a family Ratio UI's themes ship: Source Sans 3, Source
 * Serif 4, Fira Sans or Fira Sans Condensed. Another family is set in that
 * name but measured as Source Sans 3, so its lines may run short or long:
 * give it a typeface of its own (`tableMeasure`) to set it exactly.
 */
export function posterTypeface(family: string): PosterTypeface {
  const cached = typefaces.get(family);
  if (cached) return cached;
  const face: FaceMetrics = POSTER_FACES[family] ?? POSTER_FACES[POSTER_STANDARD_FONTS.body]!;
  const typeface: PosterTypeface = {
    family: `"${family.replace(/"/g, '')}", ${face.generic}`,
    ascent: face.ascent / 1000,
    descent: face.descent / 1000,
    measure: tableMeasure(POSTER_CHARS, face),
  };
  typefaces.set(family, typeface);
  return typeface;
}

/** The two faces a poster sets text in, by role. */
export interface PosterTypefaces {
  display: PosterTypeface;
  body: PosterTypeface;
}

/**
 * A theme's display and body faces, from its `font` (for example
 * `bureau.font`). Default: the standard theme's, Source Serif 4 and
 * Source Sans 3.
 */
export function posterTypefaces(
  font: { display: string; body: string } = POSTER_STANDARD_FONTS,
): PosterTypefaces {
  return { display: posterTypeface(font.display), body: posterTypeface(font.body) };
}

/** A line of set text, or the empty line between two paragraphs. */
export interface SetLine {
  text: string;
  /** An empty line between paragraphs, as tall as the paragraph gap. */
  gap: boolean;
}

/**
 * Breaks text into lines no wider than `width`. A line break in the text
 * starts a new line; an empty line between paragraphs is kept as a gap.
 * Runs of spaces collapse. A word wider than the box is split between
 * characters.
 */
export function wrapText(
  text: string,
  width: number,
  font: PosterFont,
  measure: MeasureText,
): SetLine[] {
  const lines: SetLine[] = [];
  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim());
  // Leading and trailing empty lines carry nothing.
  while (paragraphs[0] === '') paragraphs.shift();
  while (paragraphs.at(-1) === '') paragraphs.pop();
  let previousGap = false;
  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      // Several empty lines in a row are one gap.
      if (!previousGap) lines.push({ text: '', gap: true });
      previousGap = true;
      continue;
    }
    previousGap = false;
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate, font) <= width) {
        line = candidate;
        continue;
      }
      if (line) lines.push({ text: line, gap: false });
      line = '';
      for (const piece of splitWord(word, width, font, measure)) {
        if (line) lines.push({ text: line, gap: false });
        line = piece;
      }
    }
    if (line) lines.push({ text: line, gap: false });
  }
  return lines;
}

/** The word in pieces no wider than `width`, at least one character each. */
function splitWord(word: string, width: number, font: PosterFont, measure: MeasureText): string[] {
  if (measure(word, font) <= width) return [word];
  const pieces: string[] = [];
  let piece = '';
  for (const char of word) {
    if (piece && measure(piece + char, font) > width) {
      pieces.push(piece);
      piece = '';
    }
    piece += char;
  }
  if (piece) pieces.push(piece);
  return pieces;
}

/** How tall the lines are set, in poster units. */
export function linesHeight(
  lines: readonly SetLine[],
  size: number,
  lineHeight: number,
  paragraphGap: number,
): number {
  return lines.reduce(
    (height, line) => height + size * lineHeight * (line.gap ? paragraphGap : 1),
    0,
  );
}

export interface FitOptions {
  width: number;
  height: number;
  size: number | { max: number; min: number };
  weight: PosterFont['weight'];
  letterSpacing: number;
  lineHeight: number;
  paragraphGap: number;
  maxLines?: number;
}

export interface FittedText {
  lines: SetLine[];
  font: PosterFont;
  /** True when the text did not fit at the smallest size and was cut. */
  overflow: boolean;
}

/**
 * Sets text at the largest size that fits the box, between `size.max` and
 * `size.min`, to half a unit. If it does not fit at the smallest size, it is
 * set at that size and cut after the last line that fits, with an ellipsis.
 */
export function fitText(text: string, options: FitOptions, measure: MeasureText): FittedText {
  const { width, height, weight, letterSpacing, lineHeight, paragraphGap, maxLines } = options;
  const range =
    typeof options.size === 'number'
      ? { max: options.size, min: options.size }
      : { max: Math.max(options.size.max, options.size.min), min: options.size.min };
  const set = (size: number) => {
    const font: PosterFont = { size, weight, letterSpacing };
    return { font, lines: wrapText(text, width, font, measure) };
  };
  const fits = ({ font, lines }: ReturnType<typeof set>) =>
    linesHeight(lines, font.size, lineHeight, paragraphGap) <= height + 1e-6 &&
    (maxLines === undefined || lines.filter(line => !line.gap).length <= maxLines);

  const largest = set(range.max);
  if (fits(largest)) return { ...largest, overflow: false };
  const smallest = set(range.min);
  if (fits(smallest)) {
    // Search in half units: the largest size that fits.
    let low = Math.ceil(range.min * 2);
    let high = Math.floor(range.max * 2);
    let best = smallest;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const candidate = set(middle / 2);
      if (fits(candidate)) {
        best = candidate;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    return { ...best, overflow: false };
  }
  return { ...cut(smallest, options, measure), overflow: true };
}

/** The lines that fit, the last one ended with an ellipsis. */
function cut(
  { font, lines }: { font: PosterFont; lines: SetLine[] },
  options: FitOptions,
  measure: MeasureText,
): { font: PosterFont; lines: SetLine[] } {
  const kept: SetLine[] = [];
  let count = 0;
  for (const line of lines) {
    const next = [...kept, line];
    if (linesHeight(next, font.size, options.lineHeight, options.paragraphGap) > options.height + 1e-6) break;
    if (!line.gap && options.maxLines !== undefined && count >= options.maxLines) break;
    kept.push(line);
    if (!line.gap) count += 1;
  }
  while (kept.at(-1)?.gap) kept.pop();
  const last = kept.at(-1);
  if (last) {
    let text = last.text;
    while (text && measure(`${text}…`, font) > options.width) text = Array.from(text).slice(0, -1).join('');
    kept[kept.length - 1] = { text: `${text.trimEnd()}…`, gap: false };
  }
  return { font, lines: kept };
}
