// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { cssName } from './cssName';
import { isMix, isShadow, type ColorSpec, type Shadow } from './theme';

const px = (n: number) => (n === 0 ? '0' : `${n}px`);

/**
 * The CSS the web writes for a value: the seed of the theme generator, and
 * what the drift tests hold the hand-written CSS against until it lands.
 */
export function toCssValue(value: ColorSpec | Shadow | number): string {
  if (typeof value === 'number') return px(value);
  if (typeof value === 'string') return value;
  if (isMix(value)) {
    const percent = Math.round(value.alpha * 100);
    return `color-mix(in ${value.space}, var(--${cssName(value.ref)}) ${percent}%, transparent)`;
  }
  if (isShadow(value)) return `${px(value.x)} ${px(value.y)} ${px(value.blur)} ${toCssValue(value.color)}`;
  throw new Error(`Cannot write ${JSON.stringify(value)} as CSS`);
}
