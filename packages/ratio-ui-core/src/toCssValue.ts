// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { cssName } from './cssName';
import { isMix, isShadow, type ColorSpec, type Shadow, type ShadowLayers } from './theme';

const px = (n: number) => (n === 0 ? '0' : `${n}px`);

/**
 * The CSS the web writes for a value: the seed of the theme generator, and
 * what the drift tests hold the hand-written CSS against until it lands.
 */
export function toCssValue(value: ColorSpec | Shadow | ShadowLayers | null | number): string {
  if (value === null) return 'none';
  if (Array.isArray(value)) return value.map(layer => toCssValue(layer)).join(', ');
  if (typeof value === 'number') return px(value);
  if (typeof value === 'string') return value;
  if (isMix(value)) {
    const percent = Math.round(value.alpha * 100);
    return `color-mix(in ${value.space}, var(--${cssName(value.ref)}) ${percent}%, transparent)`;
  }
  if (isShadow(value)) {
    const spread = value.spread === undefined ? '' : ` ${px(value.spread)}`;
    return `${px(value.x)} ${px(value.y)} ${px(value.blur)}${spread} ${toCssValue(value.color)}`;
  }
  throw new Error(`Cannot write ${JSON.stringify(value)} as CSS`);
}
