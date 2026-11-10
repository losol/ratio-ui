// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/** A rectangle in poster units: pixels of the exported image. */
export interface PosterBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PosterWeight = 'regular' | 'bold';

/** The font a run of text is set in, as a measure sees it. */
export interface PosterFont {
  /** Size in poster units. */
  size: number;
  weight: PosterWeight;
  /** Extra space after each character, in em. */
  letterSpacing: number;
}

/** The width a run of text takes, in poster units. */
export type MeasureText = (text: string, font: PosterFont) => number;

/**
 * The face the text is set in: the CSS family a renderer writes, and how to
 * measure it. Ascent and descent are in em, to place each line's baseline.
 */
export interface PosterTypeface {
  family: string;
  ascent: number;
  descent: number;
  measure: MeasureText;
}

/** A place for text. The text shrinks from `size.max` to `size.min` until it fits. */
export interface PosterTextSlot {
  kind: 'text';
  box: PosterBox;
  /** Font size in poster units. A range lets the text shrink to fit the box. */
  size: number | { max: number; min: number };
  /** Default `bold`. */
  weight?: PosterWeight;
  /** Default: the template's `color`. */
  color?: string;
  /** Line height as a multiple of the size. Default 1.15. */
  lineHeight?: number;
  /** The height of an empty line between paragraphs, in lines. Default 1. */
  paragraphGap?: number;
  /** Default `start`. */
  align?: 'start' | 'center' | 'end';
  /** Default `top`. */
  valign?: 'top' | 'middle' | 'bottom';
  /** Extra space after each character, in em. Default 0. */
  letterSpacing?: number;
  uppercase?: boolean;
  /** At most this many lines; the text shrinks, then is cut, to stay within. */
  maxLines?: number;
}

/** A place for a picture: a logo, a photo behind the text. */
export interface PosterImageSlot {
  kind: 'image';
  box: PosterBox;
  /** `cover` fills the box and crops; `contain` (default) shows all of it. */
  fit?: 'cover' | 'contain';
}

export type PosterSlot = PosterTextSlot | PosterImageSlot;

/** A border drawn inside the poster's edge. */
export interface PosterFrame {
  /** Stroke width in poster units. */
  width: number;
  color: string;
  /** Distance from the poster's edge to the frame's outer side. Default 0. */
  inset?: number;
}

/**
 * A poster's design as data: its size, colours, frame, and the named slots
 * content goes into. Slots are drawn in the order they are written, so a
 * picture written first sits behind the text after it. The frame is drawn
 * last, on top.
 */
export interface PosterTemplate {
  width: number;
  height: number;
  /** Default white. */
  background?: string;
  /** The text colour of slots that set none. Default a near-black ink. */
  color?: string;
  frame?: PosterFrame;
  slots: Record<string, PosterSlot>;
}

export interface PosterImage {
  /** A URL. For an exported image it must be a `data:` URL. */
  src: string;
  alt?: string;
}

/** What goes in each slot, by name. A slot left out or empty is not drawn. */
export type PosterContent = Record<string, string | PosterImage | null | undefined>;

export interface PosterRectLayer {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/** One line of set text. `y` is its baseline. */
export interface PosterTextLine {
  text: string;
  x: number;
  y: number;
}

export interface PosterTextLayer {
  kind: 'text';
  slot: string;
  /** The text as given, for an accessible description. */
  source: string;
  lines: PosterTextLine[];
  family: string;
  font: PosterFont;
  color: string;
  /** Where each line's `x` is: its start, middle or end. */
  anchor: 'start' | 'middle' | 'end';
  /** True when the text did not fit at the smallest size and was cut. */
  overflow: boolean;
}

export interface PosterImageLayer {
  kind: 'image';
  slot: string;
  href: string;
  alt?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fit: 'cover' | 'contain';
}

export type PosterLayer = PosterRectLayer | PosterTextLayer | PosterImageLayer;

/** Everything a renderer draws, in drawing order, in poster units. */
export interface PosterLayout {
  width: number;
  height: number;
  layers: PosterLayer[];
  /** The text slots that did not fit at their smallest size. */
  overflow: string[];
}
