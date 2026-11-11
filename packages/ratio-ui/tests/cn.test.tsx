// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { cn } from '../src/utils';

describe('cn', () => {
  it('joins strings and leaves out falsy values', () => {
    expect(cn('a', undefined, null, false, '', 0, 'b')).toBe('a b');
  });

  it('takes nested arrays and objects, as clsx does', () => {
    expect(cn(['a', ['b', { c: true, d: false }]], { e: 1, f: 0 }, 2)).toBe('a b c e 2');
  });

  it('lets a later Tailwind class win a conflict', () => {
    expect(cn('p-4 text-sm', 'p-2')).toBe('text-sm p-2');
    expect(cn('px-2', { 'px-6': true })).toBe('px-6');
  });

  it('ignores true, as clsx does', () => {
    expect(cn(true, 'a')).toBe('a');
  });
});
