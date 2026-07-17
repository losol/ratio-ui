// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

export { CodeBlock, type CodeBlockProps } from './CodeBlock';
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
