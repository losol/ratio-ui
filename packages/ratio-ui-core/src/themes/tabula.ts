// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { defineTheme, mix, type Scale, type ShadowLayers } from '../theme';

// The soft shadow under a button at rest, the only shadow in the theme: two
// layers of black at a low alpha, as the standard theme's `shadow-sm`. It
// goes when the button is pressed, and nothing else casts one.
const soft: ShadowLayers = [
  { x: 0, y: 1, blur: 3, color: 'rgb(0 0 0 / 0.18)' },
  { x: 0, y: 1, blur: 2, color: 'rgb(0 0 0 / 0.12)' },
];

// Petrol, light to dark: the design's own ramp. Absolute steps serving both
// modes: 700 is the light arm's primary, 500 the dark arm's, 50 the tint a
// picked tile fills with.
const primary: Scale = {
  50: '#ddf1f4',
  100: '#c6e6eb',
  200: '#a3d4dc',
  300: '#7cc4cf',
  400: '#5aaebb',
  500: '#3e9aa8',
  600: '#22808f',
  700: '#0b6a78',
  800: '#084f5a',
  900: '#063f48',
  950: '#042a30',
};

// The standard theme's amber, which the CSS cascades into Tabula: the theme
// has no second colour of its own.
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

// Steps of the standard theme's warm-grey and neutral scales the chat and
// the status families read.
const secondary100 = 'oklch(0.985 0.004 88)';
const secondary400 = 'oklch(0.88 0.025 82)';
const neutral50 = 'oklch(0.9851 0.0001 263.3)';
const neutral700 = 'oklch(0.3715 0 263.3)';
const neutral900 = 'oklch(0.2046 0 263.3)';

/**
 * Tabula — the printed sheet. Latin for a board, a tablet, a form: every
 * surface is a white sheet in a thick petrol frame on a sand page, with no
 * rounded corner anywhere, and no shadow but the soft one under a button.
 * Sister to Bureau (the same teal, the same Fira Sans) but not a variant of
 * it: Bureau is paper, ink and hard offset shadows; Tabula is white, petrol
 * and flat. Values as in `ratio-ui/src/themes/tabula.css`, which stays the
 * web's source until the generator lands; `tabula.test.ts` holds the two to
 * each other. What the CSS leaves to the standard theme (the accent, the
 * status families, the chat's colours) is written out here, as Bureau does.
 */
export const tabula = defineTheme({
  name: 'tabula',

  light: {
    // Dark enough for text at AA on the sand (5.6:1) and on the sheet
    // (6.9:1), so the frames and the big words share it.
    primary: '#0b6a78', // petrol
    secondary: '#ddf1f4', // ice: the tint, a step off the sheet
    accent: accent[700],

    // A cool ink, and a grey-green for the running words.
    text: '#1e2a2e',
    textMuted: '#4a5558',
    textSubtle: '#566265', // a step below muted: 4.8:1 on the sand, 6.3:1 on the sheet
    textOnPrimary: '#ffffff',
    textOnSecondary: '#1e2a2e', // ink on ice
    textOnAccent: secondary100,

    surface: '#e7e1d1', // sand
    surfaceGlass: mix('surface', 0.88, 'oklch'),
    card: '#ffffff', // the sheet
    cardHover: '#fffcf0', // paper

    border1: '#cfc6b0', // the rule between rows
    border2: '#0b6a78', // the frame: the primary, so strong edges are petrol too

    focusRing: 'rgb(11 106 120 / 0.4)',

    // The status families are the standard theme's, which the CSS cascades
    // into Tabula; written out here until the standard theme has its own
    // file to inherit from.
    errorSolid: '#d64545',
    errorOnSolid: neutral50,
    errorBg: '#fdeeee',
    errorBorder: '#f6caca',
    errorText: '#8e2a2a',
    successSolid: '#2e9a62',
    successOnSolid: neutral50,
    successBg: '#eaf7f0',
    successBorder: '#bfe8d2',
    successText: '#1f6b46',
    infoSolid: '#2f7fa0',
    infoOnSolid: neutral50,
    infoBg: '#eaf4fa',
    infoBorder: '#c6e3f1',
    infoText: '#225e77',
    warningSolid: '#d97706',
    warningOnSolid: '#1a1405',
    warningBg: '#fff6de',
    warningBorder: '#ffe0a3',
    warningText: '#8a4b05',

    // The chat's colours are the standard theme's (tokens/chat.css), read
    // through Tabula's petrol scale.
    chatSidebarBg: secondary100,
    chatActiveBg: primary[100],
    chatActiveFg: primary[900],
    chatMentionBg: accent[100],
    chatNick: neutral700,
    chatNickOp: primary[700],
    chatNickVoice: accent[800],
    chatAvatarBg: primary[700],
    chatAvatarFg: secondary100,
    chatAvatarAltBg: accent[200],
    chatAvatarAltFg: accent[900],
    chatBubbleBg: '#ffffff', // the sheet
    chatBubbleMeBg: primary[700],
    chatBubbleMeFg: secondary100,
    chatReactionMeBg: primary[100],
    chatReactionMeBorder: primary[300],
    chatRowHoverBg: 'rgb(0 0 0 / 0.035)',
    chatPopoverBg: neutral50,
  },

  dark: {
    // The sheet goes slate, the frame a lighter petrol (5.0:1 on the sheet),
    // the ink a warm off-white.
    primary: '#3e9aa8',
    secondary: '#173a40', // the tint, dark
    accent: accent[300],

    text: '#e9e4d6',
    textMuted: '#b8b3a6',
    textSubtle: '#9a958a',
    textOnPrimary: '#101c1f',
    textOnSecondary: '#e9e4d6',
    textOnAccent: accent[950],

    surface: '#101c1f',
    surfaceGlass: mix('surface', 0.88, 'oklch'),
    card: '#172629',
    cardHover: '#1c2f33', // a step lighter than the sheet

    border1: '#2d3f43',
    border2: '#3e9aa8',

    focusRing: 'rgb(62 154 168 / 0.45)',

    // The standard dark tints; the solids carry over from light.
    errorBg: 'rgba(214, 69, 69, 0.18)',
    errorBorder: 'rgba(214, 69, 69, 0.3)',
    errorText: '#ffb3b3',
    successBg: 'rgba(46, 154, 98, 0.16)',
    successBorder: 'rgba(46, 154, 98, 0.28)',
    successText: '#a7e7c6',
    infoBg: 'rgba(47, 127, 160, 0.16)',
    infoBorder: 'rgba(47, 127, 160, 0.28)',
    infoText: '#a7d9ee',
    warningBg: 'rgba(217, 119, 6, 0.18)',
    warningBorder: 'rgba(217, 119, 6, 0.3)',
    warningText: '#ffd18a',

    chatSidebarBg: '#172629', // the sheet
    chatActiveBg: primary[900],
    chatActiveFg: secondary100,
    chatMentionBg: 'oklch(0.26 0.05 75)',
    chatNick: secondary400,
    chatNickOp: primary[300],
    chatNickVoice: accent[300],
    chatAvatarBg: primary[400],
    chatAvatarFg: primary[950],
    chatBubbleBg: '#172629', // the sheet
    chatBubbleMeBg: primary[400],
    chatBubbleMeFg: primary[950],
    chatReactionMeBg: primary[900],
    chatReactionMeBorder: primary[700],
    chatRowHoverBg: 'rgb(255 255 255 / 0.045)',
    chatPopoverBg: neutral900,
  },

  // No rounded corner anywhere, pills included.
  radius: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0, pill: 0, overlay: 0 },

  // The condensed cut for the big words and the small print, its wider
  // sibling for the running text. The CSS leaves the mono face to the
  // standard theme's system stack, which a native renderer cannot name; the
  // data names Space Mono, the face `themes/tabula-fonts.css` ships (through
  // Bureau's), so an app that embeds Tabula's files has it.
  font: { display: 'Fira Sans Condensed', body: 'Fira Sans', mono: 'Space Mono' },

  scale: { primary, accent },

  components: {
    // Square, a soft shadow at rest, and a press that drops the shadow
    // instead of moving or growing.
    button: {
      radius: 'md',
      shadow: soft,
      pressedShadow: null,
      pressedOffset: { x: 0, y: 0 },
      pressedScale: 1,
    },
    card: {
      // The sheet has no shadow: the frame carries it.
      shadow: { xs: null, sm: null, md: null },
      hoverShadow: null,
      // A featured card is the sheet itself: a thick frame in the primary.
      featured: { borderWidth: 10, borderColor: 'primary', shadow: null },
    },
    // The chat's bars and popovers keep the standard theme's soft shadows,
    // which the CSS cascades into Tabula.
    chat: {
      barShadow: [{ x: 0, y: 2, blur: 8, color: 'rgb(0 0 0 / 0.08)' }],
      popoverShadow: [{ x: 0, y: 6, blur: 20, color: 'rgb(0 0 0 / 0.12)' }],
    },
  },
});
