// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * GitHub-style heading slug.
 *
 * The single source of truth for anchor ids: whatever puts an `id` on a
 * heading and whatever builds the table of contents that links to it must run
 * the same function, or the `#anchor` and the TOC drift apart. Lower-cases,
 * drops punctuation (keeping letters, numbers and dashes, Unicode-aware), turns
 * runs of whitespace into single dashes, then collapses repeated dashes and
 * trims dashes off the ends (so `"a - b"` → `"a-b"`, not `"a---b"`).
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replaceAll('`', '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
