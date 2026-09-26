// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * `false` on the server and during hydration, `true` after. Lets a component
 * render client-only content without a hydration mismatch, and without the
 * extra commit of a `useEffect(() => setMounted(true))`.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
