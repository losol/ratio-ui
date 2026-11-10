// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui-core/posters` — beta: a poster as data. A template
// names the places on the poster; content fills them; `layoutPoster` sets
// every text at the largest size that fits its box and returns layers in
// poster units for a renderer to draw. Text is set in the theme's faces and
// measured from tables of their widths, not in a browser, so the server and
// the browser break the same lines.
// What the content is, and where it is kept, is the app's business.

export { layoutPoster, POSTER_SIZES, POSTER_TEXT_SPARE, type LayoutOptions } from './layout';
export {
  fitText,
  POSTER_STANDARD_FONTS,
  posterTypeface,
  posterTypefaces,
  tableMeasure,
  wrapText,
  type FitOptions,
  type FittedText,
  type PosterTypefaces,
  type SetLine,
} from './text';
export { POSTER_FACES, type FaceMetrics } from './metrics';
export type {
  MeasureText,
  PosterBox,
  PosterContent,
  PosterFont,
  PosterFrame,
  PosterImage,
  PosterImageLayer,
  PosterImageSlot,
  PosterLayer,
  PosterLayout,
  PosterRectLayer,
  PosterSlot,
  PosterTemplate,
  PosterTextLayer,
  PosterTextLine,
  PosterTextSlot,
  PosterTypeface,
  PosterWeight,
} from './types';
