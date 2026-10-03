// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { resolveTheme } from './resolveTheme';
import { defineTheme, mix, type ThemeMode } from './theme';

const light: ThemeMode = {
  primary: '#20304d',
  secondary: '#d9d2bf',
  accent: '#f0b429',
  text: '#20242c',
  textMuted: '#5c5644',
  textSubtle: '#6b6450',
  textOnPrimary: '#f4efe2',
  textOnSecondary: '#20242c',
  textOnAccent: '#20242c',
  surface: '#e6e0d1',
  surfaceGlass: mix('surface', 0.88, 'oklch'),
  card: '#fffdf7',
  cardHover: '#fbf6ea',
  border1: '#ddd6c5',
  border2: '#20304d',
  focusRing: '#20304d',
  errorSolid: '#b53026',
  errorOnSolid: '#f4efe2',
  errorBg: '#f7e6e3',
  errorBorder: '#e3b3ac',
  errorText: '#8a241c',
  shadowHard: { x: 2, y: 2, blur: 0, color: mix('text', 0.62) },
  shadowHardLg: { x: 3, y: 3, blur: 0, color: mix('text', 0.62) },
  shadowHardXl: { x: 5, y: 5, blur: 0, color: mix('text', 0.62) },
};

const theme = defineTheme({
  name: 'test',
  light,
  dark: { text: '#f0e7d2', surface: '#14140f' },
  radius: { xs: 2, sm: 2, md: 3, lg: 4, xl: 4, pill: 3, overlay: 4 },
  font: { display: 'Pixelify Sans', body: 'Archivo', mono: 'Space Mono' },
  scale: {
    primary: {
      50: 'oklch(1 0 0)', 100: '#111', 200: '#222', 300: '#333', 400: '#444', 500: '#555',
      600: '#666', 700: '#777', 800: '#888', 900: '#999', 950: 'oklch(0 0 0)',
    },
  },
});

describe('defineTheme', () => {
  it('fills dark from light, keeping what dark sets', () => {
    expect(theme.dark.text).toBe('#f0e7d2');
    expect(theme.dark.primary).toBe('#20304d');
    expect(theme.dark.shadowHard).toBe(light.shadowHard);
  });
});

describe('resolveTheme', () => {
  const resolved = resolveTheme(theme);

  it('leaves plain colours as hex', () => {
    expect(resolved.light.primary).toBe('#20304d');
  });

  it('follows a mix inside its own mode, so a shadow re-inks in dark', () => {
    expect(resolved.light.shadowHard).toEqual({ x: 2, y: 2, blur: 0, color: 'rgba(32, 36, 44, 0.62)' });
    expect(resolved.dark.shadowHard).toEqual({ x: 2, y: 2, blur: 0, color: 'rgba(240, 231, 210, 0.62)' });
    expect(resolved.dark.surfaceGlass).toBe('rgba(20, 20, 15, 0.88)');
  });

  it('turns the scale into hex', () => {
    expect(resolved.scale.primary[50]).toBe('#ffffff');
    expect(resolved.scale.primary[950]).toBe('#000000');
    expect(resolved.scale.primary[500]).toBe('#555555');
  });

  it('passes radius and fonts through', () => {
    expect(resolved.radius.md).toBe(3);
    expect(resolved.font.display).toBe('Pixelify Sans');
  });

  it('does not touch the authored theme', () => {
    expect(theme.light.shadowHard.color).toEqual(mix('text', 0.62));
  });

  it('refuses a reference that loops', () => {
    const looped = defineTheme({ ...theme, light: { ...light, text: mix('textMuted', 1), textMuted: mix('text', 1) }, dark: {} });
    expect(() => resolveTheme(looped)).toThrow(/loops: textMuted → text → textMuted/);
  });
});
