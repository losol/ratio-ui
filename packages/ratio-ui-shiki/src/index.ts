// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Root entrypoint — server/RSC-safe only. The client component and hook live at
// `@eventuras/ratio-ui-shiki/CodeBlock` and `.../useShikiHighlighter` so a Server
// Component can import the helpers below without a `'use client'` boundary.
export {
  createRatioHighlighter,
  shikiToLines,
  shikiToDualLines,
  DEFAULT_LANGS,
  DEFAULT_THEMES,
  SHIKI_TOKEN_CLASS,
  DUAL_THEME_CSS,
  type RatioHighlighterOptions,
  type DualThemes,
} from './highlighter';
