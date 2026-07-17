// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useMemo } from 'react';
import {
  CodeBlock as CoreCodeBlock,
  type CodeBlockProps as CoreCodeBlockProps,
} from '@eventuras/ratio-ui/core/CodeBlock';
import type { Highlighter } from 'shiki';
import { shikiToDualLines, DEFAULT_THEMES, DUAL_THEME_CSS, type DualThemes } from '../highlighter';
import { useShikiHighlighter } from '../useShikiHighlighter';

export interface CodeBlockProps extends Omit<CoreCodeBlockProps, 'highlightedLines'> {
  /**
   * Light + dark Shiki theme pair. The rendered colors follow the app's mode
   * (`data-theme` / `data-color-scheme`), like the rest of ratio-ui.
   * @default { light: 'github-light', dark: 'github-dark' }
   */
  themes?: DualThemes;
  /**
   * Reuse an existing highlighter — e.g. one shared singleton from
   * `createRatioHighlighter` preloaded with your languages — instead of letting
   * this component lazily create its own. Ensure it has `language` and both
   * themes loaded; otherwise the block falls back to un-highlighted code.
   */
  highlighter?: Highlighter;
}

/**
 * `CodeBlock`, wired to Shiki — a drop-in for `@eventuras/ratio-ui/core/CodeBlock`
 * that highlights `code` for the given `language`. It loads a highlighter
 * asynchronously (via `useShikiHighlighter`) and renders raw code until it is
 * ready, so there is no flash of missing content (graceful degradation). Token
 * colors follow the app's light/dark mode automatically.
 *
 * For static or server-rendered content, prefer the core `CodeBlock` with
 * pre-computed `highlightedLines` (build them with `shikiToDualLines` +
 * `DUAL_THEME_CSS`) so no highlighter ships to the client.
 */
export function CodeBlock({
  code,
  language,
  themes = DEFAULT_THEMES,
  highlighter,
  ...rest
}: Readonly<CodeBlockProps>) {
  const { light, dark } = themes;
  const activeHighlighter = useShikiHighlighter(themes, highlighter);

  const highlightedLines = useMemo(() => {
    const hl = activeHighlighter;
    if (!hl || !language) return undefined;
    const loadedThemes = hl.getLoadedThemes();
    if (
      !hl.getLoadedLanguages().includes(language) ||
      !loadedThemes.includes(light) ||
      !loadedThemes.includes(dark)
    ) {
      return undefined;
    }
    try {
      return shikiToDualLines(hl, code, language, { light, dark });
    } catch {
      return undefined; // unknown grammar/theme → raw code fallback
    }
  }, [activeHighlighter, code, language, light, dark]);

  return (
    <>
      {/* Injection-safe theme switch; React hoists + dedupes by href. */}
      <style href="ratio-ui-shiki-dual" precedence="medium">
        {DUAL_THEME_CSS}
      </style>
      <CoreCodeBlock code={code} language={language} highlightedLines={highlightedLines} {...rest} />
    </>
  );
}

CodeBlock.displayName = 'ShikiCodeBlock';
export default CodeBlock;
