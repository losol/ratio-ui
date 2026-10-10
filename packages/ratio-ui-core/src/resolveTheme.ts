// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { formatColor, parseColor, type Rgba } from './color';
import { fontSize, space, type FluidSize, type FontSizeStep, type SpaceStep } from './scale';
import {
  type ColorKey,
  type ColorSpec,
  type Components,
  type Font,
  type Radius,
  type Scale,
  type ScaleStep,
  type ShadowLayers,
  type Theme,
  type ThemeMode,
} from './theme';

/** One layer of a shadow, its colour an sRGB string and its spread filled in. */
export interface ResolvedShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

/** A mode with every colour an sRGB string. */
export type ResolvedMode = Record<keyof ThemeMode, string>;

type ResolvedLayers = readonly ResolvedShadow[] | null;

/** The component tokens of one mode, every shadow resolved in that mode. */
export interface ResolvedComponents {
  button: Omit<Components['button'], 'shadow' | 'pressedShadow'> & {
    shadow: ResolvedLayers;
    pressedShadow: ResolvedLayers;
  };
  card: {
    shadow: Record<'xs' | 'sm' | 'md', ResolvedLayers>;
    hoverShadow: ResolvedLayers;
    featured: Omit<Components['card']['featured'], 'shadow'> & { shadow: ResolvedLayers };
  };
  chat: { barShadow: ResolvedLayers; popoverShadow: ResolvedLayers };
}

export interface ResolvedTheme {
  name: string;
  light: ResolvedMode;
  dark: ResolvedMode;
  radius: Radius;
  font: Font;
  scale: { primary: Record<ScaleStep, string>; accent: Record<ScaleStep, string> };
  /** Font sizes in points, at the small end of the web's fluid range — a phone's. */
  fontSize: Record<FontSizeStep, number>;
  /** Spacing in points, at the small end of the web's fluid range. */
  space: Record<SpaceStep, number>;
  /** Per mode: a shadow's colour follows the mode it is drawn in. */
  components: { light: ResolvedComponents; dark: ResolvedComponents };
}

/** Points per rem, as the web's root size. */
const REM = 16;

const atSmallEnd = <K extends string>(sizes: Record<K, FluidSize>) =>
  Object.fromEntries(
    (Object.entries(sizes) as [K, FluidSize][]).map(([step, [min]]) => [step, Math.round(min * REM * 100) / 100]),
  ) as Record<K, number>;

function resolveRgba(spec: ColorSpec, mode: ThemeMode, seen: ColorKey[] = []): Rgba {
  if (typeof spec === 'string') return parseColor(spec);
  if (seen.includes(spec.ref)) throw new Error(`Colour reference loops: ${[...seen, spec.ref].join(' → ')}`);
  const base = resolveRgba(mode[spec.ref], mode, [...seen, spec.ref]);
  return { ...base, a: base.a * spec.alpha };
}

function resolveMode(mode: ThemeMode): ResolvedMode {
  const out: Partial<ResolvedMode> = {};
  for (const key of Object.keys(mode) as (keyof ThemeMode)[]) {
    out[key] = formatColor(resolveRgba(mode[key], mode));
  }
  return out as ResolvedMode;
}

function resolveComponents(components: Components, mode: ThemeMode): ResolvedComponents {
  const layers = (shadow: ShadowLayers | null): ResolvedLayers =>
    shadow?.map(({ x, y, blur, spread = 0, color }) => ({
      x,
      y,
      blur,
      spread,
      color: formatColor(resolveRgba(color, mode)),
    })) ?? null;
  const { button, card, chat } = components;
  return {
    button: {
      radius: button.radius,
      shadow: layers(button.shadow),
      pressedShadow: layers(button.pressedShadow),
      pressedOffset: { ...button.pressedOffset },
      pressedScale: button.pressedScale,
    },
    card: {
      shadow: { xs: layers(card.shadow.xs), sm: layers(card.shadow.sm), md: layers(card.shadow.md) },
      hoverShadow: layers(card.hoverShadow),
      featured: { ...card.featured, shadow: layers(card.featured.shadow) },
    },
    chat: { barShadow: layers(chat.barShadow), popoverShadow: layers(chat.popoverShadow) },
  };
}

const resolveScale = (scale: Scale) =>
  Object.fromEntries(
    Object.entries(scale).map(([step, value]) => [step, formatColor(parseColor(value))]),
  ) as Record<ScaleStep, string>;

/**
 * The theme as a renderer without a CSS engine reads it: colours as sRGB
 * hex or rgba, references followed inside their own mode, radius, font
 * sizes and spacing in points, fonts by family. Component tokens come per
 * mode, their shadows' colours resolved in it, so a renderer reads the mode
 * it draws in. The authored theme is untouched.
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
  return {
    name: theme.name,
    light: resolveMode(theme.light),
    dark: resolveMode(theme.dark),
    radius: { ...theme.radius },
    font: { ...theme.font },
    scale: { primary: resolveScale(theme.scale.primary), accent: resolveScale(theme.scale.accent) },
    fontSize: atSmallEnd(fontSize),
    space: atSmallEnd(space),
    components: {
      light: resolveComponents(theme.components, theme.light),
      dark: resolveComponents(theme.components, theme.dark),
    },
  };
}
