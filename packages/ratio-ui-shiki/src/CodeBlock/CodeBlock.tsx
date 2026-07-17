// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CodeBlock as CoreCodeBlock,
  type CodeBlockProps as CoreCodeBlockProps,
} from '@eventuras/ratio-ui/core/CodeBlock';
import type { Highlighter } from 'shiki';
import {
  createRatioHighlighter,
  shikiToDualLines,
  DEFAULT_THEMES,
  DUAL_THEME_CSS,
  type DualThemes,
} from '../highlighter';

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

// One shared highlighter per theme pair, so N CodeBlocks don't each boot Shiki.
const cache = new Map<string, Promise<Highlighter>>();
function sharedHighlighter(themes: DualThemes): Promise<Highlighter> {
  const key = `${themes.light}|${themes.dark}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = createRatioHighlighter({ themes: [themes.light, themes.dark] });
    // Don't cache a rejection forever — evict so a later mount can retry.
    const created = pending;
    created.catch(() => {
      if (cache.get(key) === created) cache.delete(key);
    });
    cache.set(key, pending);
  }
  return pending;
}

/**
 * `CodeBlock`, wired to Shiki — a drop-in for `@eventuras/ratio-ui/core/CodeBlock`
 * that highlights `code` for the given `language`. It loads a highlighter
 * asynchronously and renders raw code until it is ready, so there is no flash of
 * missing content (graceful degradation). Token colors follow the app's
 * light/dark mode automatically.
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
  const [activeHighlighter, setActiveHighlighter] = useState<Highlighter | null>(
    highlighter ?? null,
  );

  useEffect(() => {
    if (highlighter) {
      setActiveHighlighter(highlighter);
      return;
    }
    let active = true;
    sharedHighlighter({ light, dark })
      .then((h) => {
        if (active) setActiveHighlighter(h);
      })
      .catch(() => {
        // Highlighter failed to init — leave raw code (graceful degradation).
      });
    return () => {
      active = false;
    };
  }, [highlighter, light, dark]);

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
