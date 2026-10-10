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
  successSolid: '#2e9a62',
  successOnSolid: '#fafafa',
  successBg: '#eaf7f0',
  successBorder: '#bfe8d2',
  successText: '#1f6b46',
  infoSolid: '#2f7fa0',
  infoOnSolid: '#fafafa',
  infoBg: '#eaf4fa',
  infoBorder: '#c6e3f1',
  infoText: '#225e77',
  warningSolid: '#d97706',
  warningOnSolid: '#1a1405',
  warningBg: '#fff6de',
  warningBorder: '#ffe0a3',
  warningText: '#8a4b05',
  chatSidebarBg: '#fbf9f3',
  chatActiveBg: '#e6eaf7',
  chatActiveFg: '#1b2433',
  chatMentionBg: '#fdf3d8',
  chatNick: '#404040',
  chatNickOp: '#3a4a66',
  chatNickVoice: '#7a5a14',
  chatAvatarBg: '#3a4a66',
  chatAvatarFg: '#fbf9f3',
  chatAvatarAltBg: '#f6e2a9',
  chatAvatarAltFg: '#3d2c08',
  chatBubbleBg: mix('card', 1),
  chatBubbleMeBg: '#3a4a66',
  chatBubbleMeFg: '#fbf9f3',
  chatReactionMeBg: '#e6eaf7',
  chatReactionMeBorder: '#b7c1e6',
  chatRowHoverBg: 'rgb(0 0 0 / 0.035)',
  chatPopoverBg: '#fafafa',
};

const hard = [{ x: 2, y: 2, blur: 0, color: mix('text', 0.62) }];
const soft = [
  { x: 0, y: 1, blur: 3, spread: 0, color: '#0000001a' },
  { x: 0, y: 1, blur: 2, spread: -1, color: '#0000001a' },
];

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
    accent: {
      50: '#fff', 100: '#eee', 200: '#ddd', 300: '#ccc', 400: '#bbb', 500: '#aaa',
      600: '#999', 700: '#888', 800: '#777', 900: '#666', 950: '#555',
    },
  },
  components: {
    button: { radius: 'md', shadow: hard, pressedShadow: null, pressedOffset: { x: 2, y: 2 }, pressedScale: 1 },
    card: {
      shadow: { xs: null, sm: hard, md: soft },
      hoverShadow: hard,
      featured: { borderWidth: 8, borderColor: 'primary', shadow: null },
    },
    chat: { barShadow: hard, popoverShadow: soft },
  },
});

describe('defineTheme', () => {
  it('fills dark from light, keeping what dark sets', () => {
    expect(theme.dark.text).toBe('#f0e7d2');
    expect(theme.dark.primary).toBe('#20304d');
    expect(theme.dark.surfaceGlass).toBe(light.surfaceGlass);
  });
});

describe('resolveTheme', () => {
  const resolved = resolveTheme(theme);

  it('leaves plain colours as hex', () => {
    expect(resolved.light.primary).toBe('#20304d');
  });

  it('follows a mix inside its own mode, so a shadow re-inks in dark', () => {
    expect(resolved.components.light.button.shadow).toEqual([
      { x: 2, y: 2, blur: 0, spread: 0, color: 'rgba(32, 36, 44, 0.62)' },
    ]);
    expect(resolved.components.dark.button.shadow).toEqual([
      { x: 2, y: 2, blur: 0, spread: 0, color: 'rgba(240, 231, 210, 0.62)' },
    ]);
    expect(resolved.dark.surfaceGlass).toBe('rgba(20, 20, 15, 0.88)');
  });

  it('keeps every layer of a shadow, with its spread', () => {
    expect(resolved.components.light.card.shadow.md).toEqual([
      { x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0, 0, 0, 0.102)' },
      { x: 0, y: 1, blur: 2, spread: -1, color: 'rgba(0, 0, 0, 0.102)' },
    ]);
  });

  it('turns the scale into hex', () => {
    expect(resolved.scale.primary[50]).toBe('#ffffff');
    expect(resolved.scale.primary[950]).toBe('#000000');
    expect(resolved.scale.primary[500]).toBe('#555555');
    expect(resolved.scale.accent[700]).toBe('#888888');
  });

  it('passes radius and fonts through', () => {
    expect(resolved.radius.md).toBe(3);
    expect(resolved.font.display).toBe('Pixelify Sans');
  });

  it('gives font sizes and spacing in points, at the small end of the fluid range', () => {
    expect(resolved.fontSize.base).toBe(16);
    expect(resolved.fontSize.sm).toBe(14.08);
    expect(resolved.space.s).toBe(14);
    expect(resolved.space.m).toBe(21);
  });

  it('gives component tokens per mode, as copies', () => {
    expect(resolved.components.light.button.pressedScale).toBe(1);
    expect(resolved.components.dark.card.shadow.xs).toBeNull();
    resolved.components.light.button.pressedOffset.x = 9;
    expect(theme.components.button.pressedOffset.x).toBe(2);
    expect(resolved.components.dark.button.pressedOffset.x).toBe(2);
  });

  it('does not touch the authored theme', () => {
    expect(theme.components.button.shadow?.[0]?.color).toEqual(mix('text', 0.62));
    expect(theme.light.surfaceGlass).toEqual(mix('surface', 0.88, 'oklch'));
  });

  it('refuses a reference that loops', () => {
    const looped = defineTheme({ ...theme, light: { ...light, text: mix('textMuted', 1), textMuted: mix('text', 1) }, dark: {} });
    expect(() => resolveTheme(looped)).toThrow(/loops: textMuted → text → textMuted/);
  });
});
