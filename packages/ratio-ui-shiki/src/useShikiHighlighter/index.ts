// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { useEffect, useState } from 'react';
import type { HighlighterCore } from 'shiki/core';
import { createRatioHighlighter } from '../highlighter';

// The default highlighter (curated langs + github light/dark), created once and
// shared across every component that doesn't pass its own.
let defaultHighlighter: Promise<HighlighterCore> | undefined;

function getDefaultHighlighter(): Promise<HighlighterCore> {
  if (!defaultHighlighter) {
    const created = createRatioHighlighter();
    // Don't cache a rejection forever — evict so a later mount can retry.
    created.catch(() => {
      if (defaultHighlighter === created) defaultHighlighter = undefined;
    });
    defaultHighlighter = created;
  }
  return defaultHighlighter;
}

/**
 * Load (and share) the ratio-ui Shiki highlighter — the curated default set
 * from `createRatioHighlighter` (see its `DEFAULT_LANGS` + github light/dark).
 * Returns `null` while it loads, then the ready highlighter. Pass your own
 * `highlighter` — e.g. from `createRatioHighlighter` with extra language/theme
 * imports — to skip loading.
 *
 * Pair the result with `shikiToDualLines` + `DUAL_THEME_CSS` to render code
 * whose colors follow the app's light/dark mode. This is the primitive the
 * `<CodeBlock>` wrapper is built on.
 */
export function useShikiHighlighter(highlighter?: HighlighterCore): HighlighterCore | null {
  const [active, setActive] = useState<HighlighterCore | null>(highlighter ?? null);

  useEffect(() => {
    if (highlighter) {
      setActive(highlighter);
      return;
    }
    let alive = true;
    // Drop any previously-provided highlighter while the default loads, so we
    // never return a stale one (matches the "null while loading" contract).
    setActive(null);
    getDefaultHighlighter()
      .then((h) => {
        if (alive) setActive(h);
      })
      .catch(() => {
        // Highlighter failed to init — stay on null (raw-code fallback).
      });
    return () => {
      alive = false;
    };
  }, [highlighter]);

  return active;
}
