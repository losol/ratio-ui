// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/** A colour as authored: hex, `rgb()`/`rgba()`, or `oklch()`. */
export type ColorString = string;

/**
 * A colour taken from another token of the same mode, at an alpha — what
 * the CSS writes as `color-mix(in srgb, var(--text) 62%, transparent)`.
 * A reference, not a value, so it follows the token it points at: the hard
 * shadow is "the ink at 62%" in light and in dark alike.
 */
export interface Mix {
  ref: ColorKey;
  alpha: number;
  /** The space the CSS mixes in. Mixing with transparent only scales alpha, so the resolved colour is the same in any. */
  space: 'srgb' | 'oklch';
}

export type ColorSpec = ColorString | Mix;

/** An offset shadow in parts, so each renderer draws it its own way. */
export interface Shadow {
  x: number;
  y: number;
  blur: number;
  color: ColorSpec;
}

/** The colours of one mode. Keys are the CSS token names in camelCase: `--text-muted` is `textMuted`. */
export interface ThemeMode {
  primary: ColorSpec;
  secondary: ColorSpec;
  accent: ColorSpec;
  text: ColorSpec;
  textMuted: ColorSpec;
  textSubtle: ColorSpec;
  textOnPrimary: ColorSpec;
  textOnSecondary: ColorSpec;
  textOnAccent: ColorSpec;
  surface: ColorSpec;
  surfaceGlass: ColorSpec;
  card: ColorSpec;
  cardHover: ColorSpec;
  border1: ColorSpec;
  border2: ColorSpec;
  focusRing: ColorSpec;
  errorSolid: ColorSpec;
  errorOnSolid: ColorSpec;
  errorBg: ColorSpec;
  errorBorder: ColorSpec;
  errorText: ColorSpec;
  successSolid: ColorSpec;
  successOnSolid: ColorSpec;
  successBg: ColorSpec;
  successBorder: ColorSpec;
  successText: ColorSpec;
  infoSolid: ColorSpec;
  infoOnSolid: ColorSpec;
  infoBg: ColorSpec;
  infoBorder: ColorSpec;
  infoText: ColorSpec;
  warningSolid: ColorSpec;
  warningOnSolid: ColorSpec;
  warningBg: ColorSpec;
  warningBorder: ColorSpec;
  warningText: ColorSpec;
  /**
   * The chat's colours, the web's `--chat-*`.
   * @beta Named and valued as the chat components are; may change before release.
   */
  chatSidebarBg: ColorSpec;
  /** The pointed-at message, and the active room in a list. */
  chatActiveBg: ColorSpec;
  chatActiveFg: ColorSpec;
  /** The band behind a message that mentions you; its edge is `accent`. */
  chatMentionBg: ColorSpec;
  chatNick: ColorSpec;
  chatNickOp: ColorSpec;
  chatNickVoice: ColorSpec;
  chatAvatarBg: ColorSpec;
  chatAvatarFg: ColorSpec;
  chatAvatarAltBg: ColorSpec;
  chatAvatarAltFg: ColorSpec;
  chatBubbleBg: ColorSpec;
  chatBubbleMeBg: ColorSpec;
  chatBubbleMeFg: ColorSpec;
  /** A reaction of your own. */
  chatReactionMeBg: ColorSpec;
  chatReactionMeBorder: ColorSpec;
  chatRowHoverBg: ColorSpec;
  chatPopoverBg: ColorSpec;
  shadowHard: Shadow;
  shadowHardLg: Shadow;
  shadowHardXl: Shadow;
}

export type ShadowKey = 'shadowHard' | 'shadowHardLg' | 'shadowHardXl';
/** The keys of a mode that hold a colour — what a `Mix` may point at. */
export type ColorKey = Exclude<keyof ThemeMode, ShadowKey>;

/** Rounding in px, one scale for every corner. */
export interface Radius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
  overlay: number;
}

/** Font families by role. Names only — each renderer loads the files. */
export interface Font {
  display: string;
  body: string;
  mono: string;
}

/**
 * How components wear the theme — the CSS's `--button-*`, `--card-*` and
 * the chat's shadows.
 * Shadows name a shadow of the mode, so each mode inks its own; `null` is
 * no shadow.
 * @beta Grows as renderers need more components; may change before release.
 */
export interface Components {
  button: {
    /** A step of `radius`. */
    radius: keyof Radius;
    shadow: ShadowKey | null;
    /** The shadow while pressed. */
    pressedShadow: ShadowKey | null;
    /** How far a pressed button moves, in px — Bureau presses into its shadow. */
    pressedOffset: { x: number; y: number };
  };
  card: {
    /** The resting shadow of each elevation tier. */
    shadow: Record<'xs' | 'sm' | 'md', ShadowKey | null>;
    /** The lift of an interactive card on hover, or on press where there is no hover. */
    hoverShadow: ShadowKey | null;
    /** The card that should stand out (`featured`): its frame, and the shadow it keeps. */
    featured: {
      /** In px. */
      borderWidth: number;
      borderColor: ColorKey;
      shadow: ShadowKey | null;
    };
  };
  chat: {
    /** Under the composer and the room's bar. */
    barShadow: ShadowKey | null;
    /** Under the reaction picker and other popovers. */
    popoverShadow: ShadowKey | null;
  };
}

export type ScaleStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
/** An eleven-step colour scale, as authored. */
export type Scale = Record<ScaleStep, ColorString>;

export interface Theme {
  name: string;
  light: ThemeMode;
  dark: ThemeMode;
  radius: Radius;
  font: Font;
  /** `accent` is @beta: added for the chat's tokens; may change before release. */
  scale: { primary: Scale; accent: Scale };
  components: Components;
}

/** What a theme file writes: `dark` overlays `light`, as the CSS cascades. */
export interface ThemeInput extends Omit<Theme, 'dark'> {
  dark: Partial<ThemeMode>;
}

/** A colour taken from `ref` in the same mode, at `alpha`. */
export const mix = (ref: ColorKey, alpha: number, space: Mix['space'] = 'srgb'): Mix => ({
  ref,
  alpha,
  space,
});

/** Fills `dark` from `light`, so a theme writes only what changes. */
export function defineTheme(input: ThemeInput): Theme {
  return { ...input, dark: { ...input.light, ...input.dark } };
}

export const isMix = (value: unknown): value is Mix =>
  typeof value === 'object' && value !== null && 'ref' in value;

export const isShadow = (value: unknown): value is Shadow =>
  typeof value === 'object' && value !== null && 'blur' in value;
