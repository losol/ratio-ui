// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cssName } from '../cssName';
import { resolveTheme } from '../resolveTheme';
import { toCssValue } from '../toCssValue';
import { fontSize, space, type FluidSize } from '../scale';
import type { ScaleStep, ShadowKey, ThemeMode } from '../theme';
import { bureau } from './bureau';

// The web's Bureau stays hand-written until the generator lands. This holds
// the data to it: every value here must write back to the CSS as it stands.
// Not the other way round — most component tokens stay CSS-only for now.
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

const bureauCss = read('themes/bureau.css');
const standardCss = read('tokens/theme.css');
const chatCss = read('tokens/chat.css');
// What Bureau leaves out, the standard theme's semantic blocks and the chat
// tokens give it: the CSS cascades them into every theme.
const palette = blocks(standardCss, '@theme');
const standardLight = { ...blocks(standardCss, '.surface-light'), ...blocks(chatCss, '.surface-light') };
const standardDark = { ...blocks(standardCss, '.surface-dark'), ...blocks(chatCss, '.surface-dark') };

const lightCss = blocks(bureauCss, '.surface-light');
const darkCss = blocks(bureauCss, '.surface-dark');

// A `var()` there resolves where it lands: a scale step is Bureau's own
// (its primary) before the standard palette's, and a semantic alias such
// as `var(--card)` is Bureau's value in the same mode.
const unvar = (value: string | undefined, mode: (name: string) => string | undefined) =>
  value?.replace(/^var\(--([\w-]+)\)$/, (_, name: string) =>
    name.startsWith('color-') ? (lightCss[name] ?? palette[name] ?? value) : (mode(name) ?? value),
  );
const light = (name: string): string | undefined => lightCss[name] ?? unvar(standardLight[name], light);
const dark = (name: string): string | undefined =>
  darkCss[name] ?? lightCss[name] ?? unvar(standardDark[name] ?? standardLight[name], dark);

const modeKeys = Object.keys(bureau.light) as (keyof ThemeMode)[];

describe('bureau matches ratio-ui/src/themes/bureau.css', () => {
  it.each(modeKeys)('light --%s', key => {
    expect(toCssValue(bureau.light[key])).toBe(light(cssName(key)));
  });

  // What the dark block leaves out cascades from light, as `defineTheme` does.
  it.each(modeKeys)('dark --%s', key => {
    expect(toCssValue(bureau.dark[key])).toBe(dark(cssName(key)));
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

  // Bureau inherits the standard accent scale.
  it.each(Object.keys(bureau.scale.accent).map(Number) as ScaleStep[])('--color-accent-%s', step => {
    expect(bureau.scale.accent[step]).toBe(lightCss[`color-accent-${step}`] ?? palette[`color-accent-${step}`]);
  });

  const shadowVar = (key: ShadowKey | null) => (key ? `var(--${cssName(key)})` : 'none');
  const { button, card, chat } = bureau.components;

  it('--button-*', () => {
    // `--button-radius` names `--radius`, Bureau's md step.
    expect(lightCss['button-radius']).toBe('var(--radius)');
    expect(toCssValue(bureau.radius[button.radius])).toBe(lightCss['radius']);
    expect(lightCss['button-shadow']).toBe(shadowVar(button.shadow));
    expect(lightCss['button-shadow-active']).toBe(shadowVar(button.pressedShadow));
    expect(lightCss['button-transform-active']).toBe(
      `translate(${toCssValue(button.pressedOffset.x)}, ${toCssValue(button.pressedOffset.y)})`,
    );
  });

  it.each(['xs', 'sm', 'md'] as const)('--card-shadow-%s', tier => {
    expect(lightCss[`card-shadow-${tier}`]).toBe(shadowVar(card.shadow[tier]));
  });

  it('--card-hover-shadow', () => {
    expect(lightCss['card-hover-shadow']).toBe(shadowVar(card.hoverShadow));
  });

  // Width and shadow are Bureau's own; the colour is the base token's, read
  // in Bureau's mode like every other inherited value.
  it('--card-featured-*', () => {
    const base = blocks(read('tokens/card.css'), ':root');
    expect(lightCss['card-featured-border-width']).toBe(toCssValue(card.featured.borderWidth));
    expect(lightCss['card-featured-shadow']).toBe(shadowVar(card.featured.shadow));
    expect(lightCss['card-featured-border-color'] ?? base['card-featured-border-color']).toBe(
      `var(--${cssName(card.featured.borderColor)})`,
    );
  });

  it('--chat-bar-shadow and --chat-popover-shadow', () => {
    expect(lightCss['chat-bar-shadow']).toBe(shadowVar(chat.barShadow));
    expect(lightCss['chat-popover-shadow']).toBe(shadowVar(chat.popoverShadow));
  });
});

// The scales are shared by every theme, so they are held to the base tokens.
describe('the shared scales match ratio-ui/src/tokens', () => {
  const ends = (clamp: string | undefined): FluidSize => {
    const [, min, max] = /^clamp\(([\d.]+)rem,.*,\s*([\d.]+)rem\)$/.exec(clamp ?? '') ?? [];
    return [Number(min), Number(max)];
  };
  const typography = blocks(read('tokens/typography.css'), '@theme');
  const spacing = blocks(read('tokens/spacing.css'), '@theme');

  it.each(Object.keys(fontSize) as (keyof typeof fontSize)[])('--font-size-%s', step => {
    expect(ends(typography[`font-size-${step}`])).toEqual(fontSize[step]);
  });

  it.each(Object.keys(space) as (keyof typeof space)[])('--space-%s', step => {
    expect(ends(spacing[`space-${step}`])).toEqual(space[step]);
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

  // The CSS comment's claim, held: the scale's steps are absolute and 700 is
  // the light arm's primary.
  it('lands step 700 on the teal', () => {
    expect(resolved.scale.primary[700]).toBe(resolved.light.primary);
  });
});
