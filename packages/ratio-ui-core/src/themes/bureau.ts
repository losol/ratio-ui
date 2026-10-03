// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { defineTheme, mix } from '../theme';

// The hard offset shadow, Bureau's signature: the ink at reduced alpha, so
// it contrasts both the paper and the element without reading as a solid
// block. A reference, so in dark mode it re-resolves to the cream ink.
const ink = mix('text', 0.62);

/**
 * Bureau — "moderne retro", paper and navy. Values as in
 * `ratio-ui/src/themes/bureau.css`, which stays the web's source until the
 * generator lands; `bureau.test.ts` holds the two to each other.
 * Semantic tokens and the primary scale only — component tokens stay in
 * the CSS until a renderer needs them.
 */
export const bureau = defineTheme({
  name: 'bureau',

  light: {
    primary: '#20304d', // navy
    secondary: '#d9d2bf', // muted paper, a step down from surface
    accent: '#f0b429', // ochre

    text: '#20242c',
    // Darkened for WCAG AA on the mid-tone paper.
    textMuted: '#5c5644',
    textSubtle: '#6b6450',
    textOnPrimary: '#f4efe2',
    textOnSecondary: '#20242c',
    textOnAccent: '#20242c',

    surface: '#e6e0d1', // paper
    surfaceGlass: mix('surface', 0.88, 'oklch'),
    card: '#fffdf7',
    cardHover: '#fbf6ea',

    border1: '#ddd6c5',
    border2: '#20304d', // navy hairline-strong

    focusRing: '#20304d', // solid navy: a crisp ring, not a haze

    // 2px matches the press-down distance, so a pressed button covers it.
    shadowHard: { x: 2, y: 2, blur: 0, color: ink },
    shadowHardLg: { x: 3, y: 3, blur: 0, color: ink },
    shadowHardXl: { x: 5, y: 5, blur: 0, color: ink },

    // Brick — the only status family Bureau sets; the rest inherit.
    errorSolid: '#b53026',
    errorOnSolid: '#f4efe2',
    errorBg: '#f7e6e3',
    errorBorder: '#e3b3ac',
    errorText: '#8a241c',
  },

  dark: {
    primary: '#6c8bff', // blue
    secondary: '#20231b',
    accent: '#ffc23d', // gold

    text: '#f0e7d2', // ink
    textMuted: '#a39c86',
    textSubtle: '#938b75',
    textOnPrimary: '#14140f',
    textOnSecondary: '#f0e7d2',
    textOnAccent: '#14140f',

    surface: '#14140f',
    surfaceGlass: mix('surface', 0.88, 'oklch'),
    card: '#20231b',
    cardHover: '#272b20',

    border1: '#2c2c22',
    border2: '#565341',

    focusRing: '#6c8bff',

    // Coral.
    errorSolid: '#ff6e52',
    errorOnSolid: '#14140f',
    errorBg: 'rgba(255, 110, 82, 0.18)',
    errorBorder: 'rgba(255, 110, 82, 0.32)',
    errorText: '#ffb3a4',
    // Shadows inherit: the same `ink` reference, now the cream text.
  },

  // Tight corners — every step the same hard edge.
  radius: { xs: 2, sm: 2, md: 3, lg: 4, xl: 4, pill: 3, overlay: 4 },

  // Families only; the web embeds woff2, native loads TTF.
  font: { display: 'Pixelify Sans', body: 'Archivo', mono: 'Space Mono' },

  scale: {
    // Navy to blue, light to dark. Absolute steps serving both modes: 800
    // is the light arm's navy, 400 sits next to the dark arm's blue.
    primary: {
      50: 'oklch(0.975 0.008 268)',
      100: 'oklch(0.945 0.022 268)',
      200: 'oklch(0.89 0.045 269)',
      300: 'oklch(0.81 0.085 270)',
      400: 'oklch(0.7 0.15 270)',
      500: 'oklch(0.6 0.16 270)',
      600: 'oklch(0.5 0.13 267)',
      700: 'oklch(0.4 0.09 264)',
      800: 'oklch(0.31 0.057 262)',
      900: 'oklch(0.245 0.045 262)',
      950: 'oklch(0.18 0.032 262)',
    },
  },
});
