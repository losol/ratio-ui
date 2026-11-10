// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui/posters` — beta. The engine: a template and its
// content in, a poster out, as SVG that renders on the server and exports
// to an image in the browser. The model is `@eventuras/ratio-ui-core/posters`,
// re-exported so an app needs one import. Which templates exist, what the
// content says and where it is kept belong to the app.

export { Poster, PosterSvg, type PosterProps, type PosterSvgProps } from './Poster';
export { embedPosterFonts, posterMarkup, posterToBlob, type PosterImageOptions } from './toImage';
// The model, for a renderer or a check of your own; re-exported so an app
// needs one import.
export {
  fitText,
  layoutPoster,
  POSTER_FACES,
  POSTER_SIZES,
  POSTER_STANDARD_FONTS,
  posterTypeface,
  posterTypefaces,
  tableMeasure,
  wrapText,
  type FaceMetrics,
  type FitOptions,
  type FittedText,
  type LayoutOptions,
  type MeasureText,
  type PosterBox,
  type PosterContent,
  type PosterFont,
  type PosterFrame,
  type PosterImage,
  type PosterImageLayer,
  type PosterImageSlot,
  type PosterLayer,
  type PosterLayout,
  type PosterRectLayer,
  type PosterSlot,
  type PosterTemplate,
  type PosterTextLayer,
  type PosterTextLine,
  type PosterTextSlot,
  type PosterTypeface,
  type PosterTypefaces,
  type PosterWeight,
  type SetLine,
} from '@eventuras/ratio-ui-core/posters';
