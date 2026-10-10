// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { defineTheme, mix, type Scale, type ShadowLayers } from '../theme';

// The hard offset shadow, Bureau's signature: the ink at reduced alpha, so
// it contrasts both the paper and the element without reading as a solid
// block. A reference, so in dark mode it re-resolves to the cream ink.
const ink = mix('text', 0.62);

// The CSS's --shadow-hard (2px), --shadow-hard-lg (3px) and --shadow-hard-xl
// (5px): an offset with no blur. 2px matches the press-down distance, so a
// pressed button covers it.
const hard = (offset: number): ShadowLayers => [{ x: offset, y: offset, blur: 0, color: ink }];

// Teal, light to dark. Absolute steps serving both modes: 700 is the
// light arm's primary, 400 sits next to the dark arm's muted teal.
const primary: Scale = {
  50: 'oklch(0.975 0.01 210)',
  100: 'oklch(0.945 0.024 210)',
  200: 'oklch(0.89 0.045 211)',
  300: 'oklch(0.81 0.068 210)',
  400: 'oklch(0.7 0.085 208)',
  500: 'oklch(0.62 0.095 212)',
  600: 'oklch(0.55 0.097 215)',
  700: 'oklch(0.483 0.086 216)',
  800: 'oklch(0.4 0.07 217)',
  900: 'oklch(0.32 0.055 218)',
  950: 'oklch(0.24 0.04 218)',
};

// The standard theme's amber, which the CSS cascades into Bureau.
const accent: Scale = {
  50: 'oklch(0.988 0.012 92)',
  100: 'oklch(0.965 0.04 90)',
  200: 'oklch(0.928 0.075 88)',
  300: 'oklch(0.88 0.105 88)',
  400: 'oklch(0.815 0.125 85)',
  500: 'oklch(0.745 0.13 82)',
  600: 'oklch(0.64 0.125 80)',
  700: 'oklch(0.52 0.105 78)',
  800: 'oklch(0.405 0.085 76)',
  900: 'oklch(0.295 0.06 75)',
  950: 'oklch(0.18 0.038 74)',
};

// Steps of the standard theme's warm-grey and neutral scales the chat reads.
const secondary100 = 'oklch(0.985 0.004 88)';
const secondary400 = 'oklch(0.88 0.025 82)';
const neutral50 = 'oklch(0.9851 0.0001 263.3)';
const neutral700 = 'oklch(0.3715 0 263.3)';
const neutral900 = 'oklch(0.2046 0 263.3)';

/**
 * Bureau — "moderne retro", paper, teal and ink. Values as in
 * `ratio-ui/src/themes/bureau.css`, which stays the web's source until the
 * generator lands; `bureau.test.ts` holds the two to each other.
 * Semantic tokens, the chat's colours, the primary and accent scales, and
 * the button, card and chat-shadow tokens a native renderer needs; the rest of the component tokens stay in the CSS
 * until a renderer needs them.
 */
export const bureau = defineTheme({
  name: 'bureau',

  light: {
    // Dark enough to carry link text at AA on the paper and on cards.
    primary: '#006a7d', // teal
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
    border2: '#20242c', // the ink: the strong edge round panels

    focusRing: '#006a7d', // solid teal: a crisp ring, not a haze

    // Brick — the only status family Bureau sets; the rest inherit.
    errorSolid: '#b53026',
    errorOnSolid: '#f4efe2',
    errorBg: '#f7e6e3',
    errorBorder: '#e3b3ac',
    errorText: '#8a241c',

    // Success, info and warning are the standard theme's, which the CSS
    // cascades into Bureau; written out here until the standard theme has
    // its own file to inherit from.
    successSolid: '#2e9a62',
    successOnSolid: 'oklch(0.9851 0.0001 263.3)',
    successBg: '#eaf7f0',
    successBorder: '#bfe8d2',
    successText: '#1f6b46',
    infoSolid: '#2f7fa0',
    infoOnSolid: 'oklch(0.9851 0.0001 263.3)',
    infoBg: '#eaf4fa',
    infoBorder: '#c6e3f1',
    infoText: '#225e77',
    warningSolid: '#d97706',
    warningOnSolid: '#1a1405',
    warningBg: '#fff6de',
    warningBorder: '#ffe0a3',
    warningText: '#8a4b05',

    // The chat's colours are the standard theme's (tokens/chat.css), read
    // through Bureau's scales.
    chatSidebarBg: secondary100,
    chatActiveBg: primary[100],
    chatActiveFg: primary[900],
    chatMentionBg: accent[100],
    chatNick: neutral700,
    chatNickOp: primary[700],
    chatNickVoice: accent[700],
    chatAvatarBg: primary[700],
    chatAvatarFg: secondary100,
    chatAvatarAltBg: accent[200],
    chatAvatarAltFg: accent[900],
    chatBubbleBg: '#fffdf7', // the card
    chatBubbleMeBg: primary[700],
    chatBubbleMeFg: secondary100,
    chatReactionMeBg: primary[100],
    chatReactionMeBorder: primary[300],
    chatRowHoverBg: 'rgb(0 0 0 / 0.035)',
    chatPopoverBg: neutral50,
  },

  dark: {
    // Muted: a dark page carries less colour.
    primary: '#4fa3ae', // teal
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

    focusRing: '#4fa3ae',

    // Coral.
    errorSolid: '#ff6e52',
    errorOnSolid: '#14140f',
    errorBg: 'rgba(255, 110, 82, 0.18)',
    errorBorder: 'rgba(255, 110, 82, 0.32)',
    errorText: '#ffb3a4',

    // The standard dark tints; the solids carry over from light.
    successBg: 'rgba(46, 154, 98, 0.16)',
    successBorder: 'rgba(46, 154, 98, 0.28)',
    successText: '#a7e7c6',
    infoBg: 'rgba(47, 127, 160, 0.16)',
    infoBorder: 'rgba(47, 127, 160, 0.28)',
    infoText: '#a7d9ee',
    warningBg: 'rgba(217, 119, 6, 0.18)',
    warningBorder: 'rgba(217, 119, 6, 0.3)',
    warningText: '#ffd18a',

    chatSidebarBg: '#20231b', // the card
    chatActiveBg: primary[900],
    chatActiveFg: secondary100,
    chatMentionBg: 'oklch(0.26 0.05 75)',
    chatNick: secondary400,
    chatNickOp: primary[300],
    chatNickVoice: accent[300],
    chatAvatarBg: primary[400],
    chatAvatarFg: primary[950],
    chatBubbleBg: '#20231b', // the card
    chatBubbleMeBg: primary[400],
    chatBubbleMeFg: primary[950],
    chatReactionMeBg: primary[900],
    chatReactionMeBorder: primary[700],
    chatRowHoverBg: 'rgb(255 255 255 / 0.045)',
    chatPopoverBg: neutral900,
    // The shadows' ink is a reference, so here it is the cream text.
  },

  // Tight corners — every step the same hard edge.
  radius: { xs: 2, sm: 2, md: 3, lg: 4, xl: 4, pill: 3, overlay: 4 },

  // Families only; the web embeds woff2, native loads TTF.
  font: { display: 'Fira Sans', body: 'Fira Sans', mono: 'Space Mono' },

  scale: { primary, accent },

  components: {
    // The hard shadow at rest; a press moves the button into it, and the
    // shadow goes, so the button seems to sink into the page.
    button: {
      radius: 'md',
      shadow: hard(2),
      pressedShadow: null,
      pressedOffset: { x: 2, y: 2 },
      pressedScale: 1,
    },
    card: {
      shadow: { xs: hard(2), sm: hard(2), md: hard(2) },
      hoverShadow: hard(3),
      // Framed like a poster: a thick primary border, no shadow.
      featured: { borderWidth: 8, borderColor: 'primary', shadow: null },
    },
    chat: { barShadow: hard(2), popoverShadow: hard(3) },
  },
});
