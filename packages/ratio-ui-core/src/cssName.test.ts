// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { expect, it } from 'vitest';
import { cssName } from './cssName';

it('turns a key into its CSS token name', () => {
  expect(cssName('primary')).toBe('primary');
  expect(cssName('textOnPrimary')).toBe('text-on-primary');
  expect(cssName('border1')).toBe('border-1');
  expect(cssName('shadowHardLg')).toBe('shadow-hard-lg');
  expect(cssName('errorBg')).toBe('error-bg');
});
