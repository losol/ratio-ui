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
  codeToDualTokens,
  DEFAULT_LANGS,
  DEFAULT_THEMES,
  type RatioHighlighterOptions,
  type DualThemes,
} from './highlighter';

// The Shiki-free half — also available standalone (without pulling in any
// shiki imports) as `@eventuras/ratio-ui-shiki/tokens`.
export {
  tokensToLines,
  DualThemeStyles,
  SHIKI_TOKEN_CLASS,
  DUAL_THEME_CSS,
  type DualToken,
  type DualTokenLine,
} from './tokens';
