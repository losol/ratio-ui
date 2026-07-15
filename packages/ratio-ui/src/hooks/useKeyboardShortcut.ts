// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { useEffect, useRef } from 'react';

export interface UseKeyboardShortcutOptions {
  /** Turn the listener on/off without unmounting. @default true */
  enabled?: boolean;
  /** Call `preventDefault()` on match — stops e.g. the browser's own ⌘K. @default true */
  preventDefault?: boolean;
}

/** True on Apple platforms — decides whether `mod` means ⌘ or Ctrl. */
export function isApplePlatform(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.platform);
}

/**
 * Human-readable label for a shortcut combo — for `<Kbd>` hints.
 * `'mod+k'` → `⌘K` on Apple platforms, `Ctrl+K` elsewhere.
 */
export function shortcutLabel(combo: string): string {
  const apple = isApplePlatform();
  return combo
    .split('+')
    .map((part) => {
      const p = part.trim().toLowerCase();
      if (p === 'mod') return apple ? '⌘' : 'Ctrl';
      if (p === 'meta' || p === 'cmd') return apple ? '⌘' : 'Win';
      if (p === 'ctrl') return apple ? '⌃' : 'Ctrl';
      if (p === 'alt') return apple ? '⌥' : 'Alt';
      if (p === 'shift') return apple ? '⇧' : 'Shift';
      return p.length === 1 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join(apple ? '' : '+');
}

/**
 * Global keyboard shortcut — parses a `'mod+k'`-style combo and fires the
 * handler on match. `mod` matches ⌘ on Apple platforms and Ctrl elsewhere.
 * The handler is kept in a ref, so an inline lambda doesn't re-bind the
 * listener on every render. SSR-safe.
 *
 * The generic building block behind `SearchField`'s `shortcut` prop —
 * reusable for command palettes, dialogs, and anything else.
 *
 * @example
 * useKeyboardShortcut('mod+k', () => inputRef.current?.focus());
 */
export function useKeyboardShortcut(
  combo: string,
  handler: (event: KeyboardEvent) => void,
  { enabled = true, preventDefault = true }: UseKeyboardShortcutOptions = {},
): void {
  const handlerRef = useRef(handler);
  // Keep the latest handler without re-binding the listener — updated in an
  // effect (post-render), not during render.
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const parts = combo.toLowerCase().split('+').map((p) => p.trim());
    const key = parts[parts.length - 1];
    const wantsMod = parts.includes('mod');
    const wantsMeta = parts.includes('meta') || parts.includes('cmd');
    const wantsCtrl = parts.includes('ctrl');
    const wantsAlt = parts.includes('alt');
    const wantsShift = parts.includes('shift');

    // `mod` resolves per platform (⌘ on Apple, Ctrl elsewhere), and every
    // modifier is matched exactly — Ctrl+K must not fire a `mod+k` handler
    // on macOS, and extra held modifiers must not match.
    const apple = isApplePlatform();
    const expectMeta = wantsMeta || (wantsMod && apple);
    const expectCtrl = wantsCtrl || (wantsMod && !apple);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key) return;
      if (event.metaKey !== expectMeta) return;
      if (event.ctrlKey !== expectCtrl) return;
      if (event.altKey !== wantsAlt) return;
      if (event.shiftKey !== wantsShift) return;
      if (preventDefault) event.preventDefault();
      handlerRef.current(event);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [combo, enabled, preventDefault]);
}
