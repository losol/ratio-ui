// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/** Merge ID reference lists without repeating a caller's or generated ID. */
export function mergeDescribedBy(...references: (string | undefined)[]): string | undefined {
  const ids = references.flatMap((reference) => reference?.split(/\s+/).filter(Boolean) ?? []);
  return [...new Set(ids)].join(' ') || undefined;
}
