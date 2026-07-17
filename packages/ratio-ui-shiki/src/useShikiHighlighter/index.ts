// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { useEffect, useState } from 'react';
import type { Highlighter } from 'shiki';
import { createRatioHighlighter, DEFAULT_THEMES, type DualThemes } from '../highlighter';

// One shared highlighter per theme pair, so N consumers don't each boot Shiki.
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
 * Load (and share) a Shiki highlighter for a light/dark theme pair. Returns
 * `null` while it loads — including immediately after `themes` changes, until
 * the new pair is ready, so callers never receive a highlighter missing the
 * requested themes. Highlighters are cached per theme pair, so many components
 * share one. Pass your own `highlighter` to skip loading — e.g. one preloaded
 * with extra languages via `createRatioHighlighter`.
 *
 * Pair the result with `shikiToDualLines` + `DUAL_THEME_CSS` to render code
 * whose colors follow the app's light/dark mode. This is the primitive the
 * `<CodeBlock>` wrapper is built on.
 */
export function useShikiHighlighter(
  themes: DualThemes = DEFAULT_THEMES,
  highlighter?: Highlighter,
): Highlighter | null {
  const { light, dark } = themes;
  const [active, setActive] = useState<Highlighter | null>(highlighter ?? null);

  useEffect(() => {
    if (highlighter) {
      setActive(highlighter);
      return;
    }
    let alive = true;
    // Drop any highlighter from a previous theme pair while the new one loads,
    // so we never hand back one that lacks the current `light`/`dark` themes.
    setActive(null);
    sharedHighlighter({ light, dark })
      .then((h) => {
        if (alive) setActive(h);
      })
      .catch(() => {
        // Highlighter failed to init — stay on null (raw-code fallback).
      });
    return () => {
      alive = false;
    };
  }, [highlighter, light, dark]);

  return active;
}
