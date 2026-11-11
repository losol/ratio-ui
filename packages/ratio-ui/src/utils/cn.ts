// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { twMerge } from 'tailwind-merge';

/**
 * What `cn` takes: class strings, and falsy values to leave out, in any
 * nesting of arrays, or an object whose keys are classes kept where the
 * value is truthy. The same shapes as `clsx`.
 */
export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [className: string]: unknown };

function join(value: ClassValue, out: string[]): void {
  if (!value) return;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    out.push(String(value));
  } else if (Array.isArray(value)) {
    for (const item of value) join(item, out);
  } else if (typeof value === 'object') {
    for (const [className, on] of Object.entries(value)) if (on) out.push(className);
  }
}

/** Merge class names with Tailwind conflict resolution. Later args override earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  join(inputs, classes);
  return twMerge(classes.join(' '));
}
