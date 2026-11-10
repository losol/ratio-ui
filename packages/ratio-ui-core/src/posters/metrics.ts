// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Advance widths of a bold and a regular grotesque, in thousandths of an em,
// read from Liberation Sans 2 (SIL OFL), which is metric-compatible with
// Arial. Arial, Liberation Sans and Helvetica set a line to the same width
// (Helvetica within a hair), so a poster laid out with these numbers fits
// the same on the server, in a browser and in an exported image.
// Latin letters with Nordic and Western European accents, digits and common
// punctuation; anything else is measured at the average width.

/** The characters the tables cover, in table order. */
export const SANS_CHARS = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ÆØÅæøåÄÖÜäöüÉéÈèÊêÀàÁáÓóÚúÍíÑñÇçß«»–—‘’“”…€§°·×";

/** Regular weight, one width per character of `SANS_CHARS`. */
export const SANS_REGULAR: readonly number[] = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 1000,
  778, 667, 889, 611, 556, 667, 778, 722, 556, 556, 556, 667, 556, 667, 556, 667,
  556, 667, 556, 667, 556, 778, 556, 722, 556, 278, 278, 722, 556, 722, 500, 611,
  556, 556, 556, 1000, 222, 222, 333, 333, 1000, 556, 556, 400, 333, 584,
];

/** Bold weight, one width per character of `SANS_CHARS`. */
export const SANS_BOLD: readonly number[] = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 1000,
  778, 722, 889, 611, 556, 722, 778, 722, 556, 611, 611, 667, 556, 667, 556, 667,
  556, 722, 556, 722, 556, 778, 611, 722, 611, 278, 278, 722, 611, 722, 556, 611,
  556, 556, 556, 1000, 278, 278, 500, 500, 1000, 556, 556, 400, 333, 584,
];

/** Ascent and descent of the face, in thousandths of an em. */
export const SANS_ASCENT = 905;
export const SANS_DESCENT = 212;
