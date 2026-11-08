// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cssName } from '../cssName';
import { resolveTheme } from '../resolveTheme';
import { toCssValue } from '../toCssValue';
import type { ScaleStep, ThemeMode } from '../theme';
import { tabula } from './tabula';

// The web's Tabula stays hand-written until the generator lands. This holds
// the data to it: every value here must write back to the CSS as it stands,
// or to the standard theme's value where Tabula leaves a token alone.
const read = (path: string) =>
  readFileSync(new URL(`../../../ratio-ui/src/${path}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

type Block = Record<string, string>;
const blocks = (css: string, selectorHas: string): Block => {
  const out: Block = {};
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector!.includes(selectorHas)) continue;
    for (const [, name, value] of body!.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) out[name!] = value!.trim();
  }
  return out;
};

const tabulaCss = read('themes/tabula.css');
const standardCss = read('tokens/theme.css');
const chatCss = read('tokens/chat.css');
// What Tabula leaves out, the standard theme's semantic blocks and the chat
// tokens give it: the CSS cascades them into every theme.
const palette = blocks(standardCss, '@theme');
const standardLight = { ...blocks(standardCss, '.surface-light'), ...blocks(chatCss, '.surface-light') };
const standardDark = { ...blocks(standardCss, '.surface-dark'), ...blocks(chatCss, '.surface-dark') };

// Tabula's light arm doubles as its `.surface-light` context, and its dark
// arm as `.surface-dark`, so the blocks are found by those names.
const lightCss = blocks(tabulaCss, '.surface-light');
const darkCss = blocks(tabulaCss, '.surface-dark');

// A `var()` there resolves where it lands: a scale step is Tabula's own
// (its primary) before the standard palette's, and a semantic alias such
// as `var(--card)` is Tabula's value in the same mode.
const unvar = (value: string | undefined, mode: (name: string) => string | undefined) =>
  value?.replace(/^var\(--([\w-]+)\)$/, (_, name: string) =>
    name.startsWith('color-') ? (lightCss[name] ?? palette[name] ?? value) : (mode(name) ?? value),
  );
const light = (name: string): string | undefined => lightCss[name] ?? unvar(standardLight[name], light);
const dark = (name: string): string | undefined =>
  darkCss[name] ?? lightCss[name] ?? unvar(standardDark[name] ?? standardLight[name], dark);

const modeKeys = Object.keys(tabula.light) as (keyof ThemeMode)[];

describe('tabula matches ratio-ui/src/themes/tabula.css', () => {
  it.each(modeKeys)('light --%s', key => {
    expect(toCssValue(tabula.light[key])).toBe(light(cssName(key)));
  });

  // What the dark block leaves out cascades from light, as `defineTheme` does.
  it.each(modeKeys)('dark --%s', key => {
    expect(toCssValue(tabula.dark[key])).toBe(dark(cssName(key)));
  });

  it.each(Object.keys(tabula.radius) as (keyof typeof tabula.radius)[])('--radius-%s', step => {
    expect(toCssValue(tabula.radius[step])).toBe(lightCss[`radius-${step}`]);
  });

  it.each(['display', 'body'] as const)('--font-%s names the family', role => {
    expect(lightCss[`font-${role}`]).toMatch(new RegExp(`^"${tabula.font[role]}"`));
  });

  // The CSS leaves the mono face to the standard theme's system stack. The
  // data names the face Tabula's font file ships, through Bureau's.
  it('--font-mono is the face tabula-fonts.css ships', () => {
    expect(lightCss['font-mono']).toBeUndefined();
    expect(read('themes/tabula-fonts.css')).toMatch(/@import\s+"\.\/bureau-fonts\.css"/);
    expect(read('themes/bureau-fonts.css')).toContain(`font-family: "${tabula.font.mono}"`);
  });

  it.each(Object.keys(tabula.scale.primary).map(Number) as ScaleStep[])('--color-primary-%s', step => {
    expect(tabula.scale.primary[step]).toBe(lightCss[`color-primary-${step}`]);
  });

  // Tabula inherits the standard accent scale.
  it.each(Object.keys(tabula.scale.accent).map(Number) as ScaleStep[])('--color-accent-%s', step => {
    expect(tabula.scale.accent[step]).toBe(lightCss[`color-accent-${step}`] ?? palette[`color-accent-${step}`]);
  });

  const { button, card, chat } = tabula.components;

  it('--button-*', () => {
    // Square: the radius is written as 0, not as a step.
    expect(lightCss['button-radius']).toBe(toCssValue(tabula.radius[button.radius]));
    expect(lightCss['button-shadow']).toBe(toCssValue(button.shadow));
    expect(lightCss['button-shadow-active']).toBe(toCssValue(button.pressedShadow));
    // A press that neither moves nor grows.
    expect(lightCss['button-transform-active']).toBe('none');
    expect(button.pressedOffset).toEqual({ x: 0, y: 0 });
    expect(button.pressedScale).toBe(1);
  });

  it.each(['xs', 'sm', 'md'] as const)('--card-shadow-%s', tier => {
    expect(lightCss[`card-shadow-${tier}`]).toBe(toCssValue(card.shadow[tier]));
  });

  it('--card-hover-shadow', () => {
    expect(lightCss['card-hover-shadow']).toBe(toCssValue(card.hoverShadow));
  });

  // Width and shadow are Tabula's own; the colour is the base token's.
  it('--card-featured-*', () => {
    const base = blocks(read('tokens/card.css'), ':root');
    expect(lightCss['card-featured-border-width']).toBe(toCssValue(card.featured.borderWidth));
    expect(lightCss['card-featured-shadow']).toBe(toCssValue(card.featured.shadow));
    expect(lightCss['card-featured-border-color'] ?? base['card-featured-border-color']).toBe(
      `var(--${cssName(card.featured.borderColor)})`,
    );
  });

  // Tabula sets neither; the standard chat tokens cascade in.
  it('--chat-bar-shadow and --chat-popover-shadow', () => {
    expect(light('chat-bar-shadow')).toBe(toCssValue(chat.barShadow));
    expect(light('chat-popover-shadow')).toBe(toCssValue(chat.popoverShadow));
  });
});

describe('tabula resolves for a renderer without CSS', () => {
  const resolved = resolveTheme(tabula);

  it('casts no shadow but the button’s', () => {
    expect(resolved.components.light.card.shadow).toEqual({ xs: null, sm: null, md: null });
    expect(resolved.components.light.card.featured.shadow).toBeNull();
    expect(resolved.components.light.button.shadow).toEqual([
      { x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0, 0, 0, 0.18)' },
      { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0, 0, 0, 0.12)' },
    ]);
    expect(resolved.components.dark.button.pressedShadow).toBeNull();
  });

  it('has no rounded corner', () => {
    expect(Object.values(resolved.radius).every(r => r === 0)).toBe(true);
  });

  // The CSS comment's claim, held: the scale's steps are absolute, 700 the
  // light arm's primary and 500 the dark arm's.
  it('lands steps 700 and 500 on the two petrols', () => {
    expect(resolved.scale.primary[700]).toBe(resolved.light.primary);
    expect(resolved.scale.primary[500]).toBe(resolved.dark.primary);
  });

  it('frames in the primary', () => {
    expect(resolved.light.border2).toBe(resolved.light.primary);
    expect(resolved.dark.border2).toBe(resolved.dark.primary);
  });
});
