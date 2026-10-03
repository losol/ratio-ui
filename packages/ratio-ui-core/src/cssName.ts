// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/** The CSS token name of a key: `textOnPrimary` → `text-on-primary`, `border1` → `border-1`. */
export const cssName = (key: string): string =>
  key
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
    .toLowerCase();
