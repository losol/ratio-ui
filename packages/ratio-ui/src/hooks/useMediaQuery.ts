// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Whether a CSS media query matches — `false` on the server and during
 * hydration, then live. For layout decisions CSS cannot make on its own:
 * which of two components to render, whether a panel starts collapsed,
 * whether a list is paged or scrolled.
 *
 * Prefer a media query in CSS when only styling changes; reach for this when
 * the markup or the behaviour does.
 *
 * @example
 * const narrow = useMediaQuery('(max-width: 639px)');
 * <Panel collapsible={narrow} defaultOpen={!narrow}>…</Panel>
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
