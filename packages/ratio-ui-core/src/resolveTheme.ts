// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { formatColor, parseColor, type Rgba } from './color';
import {
  isMix,
  isShadow,
  type ColorKey,
  type ColorSpec,
  type Font,
  type Radius,
  type Scale,
  type ScaleStep,
  type Shadow,
  type Theme,
  type ThemeMode,
} from './theme';

export interface ResolvedShadow {
  x: number;
  y: number;
  blur: number;
  color: string;
}

/** A mode with every colour an sRGB string and every shadow in parts. */
export type ResolvedMode = {
  [K in keyof ThemeMode]: ThemeMode[K] extends Shadow ? ResolvedShadow : string;
};

export interface ResolvedTheme {
  name: string;
  light: ResolvedMode;
  dark: ResolvedMode;
  radius: Radius;
  font: Font;
  scale: { primary: Record<ScaleStep, string> };
}

function resolveRgba(spec: ColorSpec, mode: ThemeMode, seen: ColorKey[] = []): Rgba {
  if (typeof spec === 'string') return parseColor(spec);
  if (seen.includes(spec.ref)) throw new Error(`Colour reference loops: ${[...seen, spec.ref].join(' → ')}`);
  const base = resolveRgba(mode[spec.ref], mode, [...seen, spec.ref]);
  return { ...base, a: base.a * spec.alpha };
}

function resolveMode(mode: ThemeMode): ResolvedMode {
  const out: Partial<Record<keyof ThemeMode, string | ResolvedShadow>> = {};
  for (const key of Object.keys(mode) as (keyof ThemeMode)[]) {
    const value = mode[key];
    if (isShadow(value)) {
      out[key] = { ...value, color: formatColor(resolveRgba(value.color, mode)) };
    } else if (typeof value === 'string' || isMix(value)) {
      out[key] = formatColor(resolveRgba(value, mode));
    }
  }
  return out as ResolvedMode;
}

const resolveScale = (scale: Scale) =>
  Object.fromEntries(
    Object.entries(scale).map(([step, value]) => [step, formatColor(parseColor(value))]),
  ) as Record<ScaleStep, string>;

/**
 * The theme as a renderer without a CSS engine reads it: colours as sRGB
 * hex or rgba, references followed inside their own mode, radius in
 * points, fonts by family. The authored theme is untouched.
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
  return {
    name: theme.name,
    light: resolveMode(theme.light),
    dark: resolveMode(theme.dark),
    radius: { ...theme.radius },
    font: { ...theme.font },
    scale: { primary: resolveScale(theme.scale.primary) },
  };
}
