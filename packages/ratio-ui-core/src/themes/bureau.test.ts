// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cssName } from '../cssName';
import { resolveTheme } from '../resolveTheme';
import { toCssValue } from '../toCssValue';
import type { ScaleStep, ThemeMode } from '../theme';
import { bureau } from './bureau';

// The web's Bureau stays hand-written until the generator lands. This holds
// the data to it: every value here must write back to the CSS as it stands.
// Not the other way round — component tokens stay CSS-only for now.
const css = readFileSync(new URL('../../../ratio-ui/src/themes/bureau.css', import.meta.url), 'utf8');

type Block = Record<string, string>;
const blocks = (selectorHas: string): Block => {
  const out: Block = {};
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, selector, body] of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector!.includes(selectorHas)) continue;
    for (const [, name, value] of body!.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) out[name!] = value!.trim();
  }
  return out;
};
const lightCss = blocks('.surface-light');
const darkCss = blocks('.surface-dark');

const modeKeys = Object.keys(bureau.light) as (keyof ThemeMode)[];

describe('bureau matches ratio-ui/src/themes/bureau.css', () => {
  it.each(modeKeys)('light --%s', key => {
    expect(toCssValue(bureau.light[key])).toBe(lightCss[cssName(key)]);
  });

  // What the dark block leaves out cascades from light, as `defineTheme` does.
  it.each(modeKeys)('dark --%s', key => {
    const name = cssName(key);
    expect(toCssValue(bureau.dark[key])).toBe(darkCss[name] ?? lightCss[name]);
  });

  it.each(Object.keys(bureau.radius) as (keyof typeof bureau.radius)[])('--radius-%s', step => {
    expect(toCssValue(bureau.radius[step])).toBe(lightCss[`radius-${step}`]);
  });

  it.each(Object.keys(bureau.font) as (keyof typeof bureau.font)[])('--font-%s names the family', role => {
    expect(lightCss[`font-${role}`]).toMatch(new RegExp(`^"${bureau.font[role]}"`));
  });

  it.each(Object.keys(bureau.scale.primary).map(Number) as ScaleStep[])('--color-primary-%s', step => {
    expect(bureau.scale.primary[step]).toBe(lightCss[`color-primary-${step}`]);
  });
});

describe('bureau resolves for a renderer without CSS', () => {
  const resolved = resolveTheme(bureau);

  it('inks the hard shadow with the mode it sits in', () => {
    expect(resolved.light.shadowHard.color).toBe('rgba(32, 36, 44, 0.62)');
    expect(resolved.dark.shadowHard.color).toBe('rgba(240, 231, 210, 0.62)');
  });

  it('gives the primary scale as hex', () => {
    for (const value of Object.values(resolved.scale.primary)) expect(value).toMatch(/^#[0-9a-f]{6}$/);
  });

  // The CSS comment's claim, held: the scale's steps are absolute and 800 is
  // the light arm's primary.
  it('lands step 800 on the navy', () => {
    expect(resolved.scale.primary[800]).toBe(resolved.light.primary);
  });
});
