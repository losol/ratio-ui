// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/** A colour in sRGB: channels 0–255, alpha 0–1. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const to255 = (v: number) => Math.round(clamp01(v) * 255);

// Linear sRGB → sRGB transfer curve.
const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

/**
 * OKLCH → sRGB, by Björn Ottosson's matrices. Out-of-gamut colours are
 * clipped per channel; CSS gamut-maps instead, so a step at the edge of
 * sRGB can land a notch off what the browser shows.
 */
export function oklchToRgba(L: number, C: number, h: number, a = 1): Rgba {
  const rad = (h * Math.PI) / 180;
  const A = C * Math.cos(rad);
  const B = C * Math.sin(rad);

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.291485548 * B;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return { r: to255(gamma(r)), g: to255(gamma(g)), b: to255(gamma(b)), a };
}

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FN = /^(rgba?|oklch)\(\s*([^)]*?)\s*\)$/i;

const num = (token: string, what: string): number => {
  const v = Number(token);
  if (Number.isNaN(v)) throw new Error(`Unexpected ${what} "${token}"`);
  return v;
};

/**
 * Reads the forms the themes are written in: `#rgb[a]`, `#rrggbb[aa]`,
 * `rgb()`/`rgba()` with commas or spaces, and `oklch()`. Anything else
 * throws — a theme value nobody can parse is a bug, not a fallback.
 */
export function parseColor(input: string): Rgba {
  const value = input.trim();

  const hex = HEX.exec(value)?.[1];
  if (hex) {
    const wide = hex.length <= 4 ? [...hex].map(ch => ch + ch).join('') : hex;
    const n = (i: number) => parseInt(wide.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: wide.length === 8 ? n(6) / 255 : 1 };
  }

  const fn = FN.exec(value);
  if (!fn) throw new Error(`Unsupported colour "${input}"`);
  const [, name, body] = fn as unknown as [string, string, string];
  // `rgb(0 0 0 / 0.5)` and `rgba(0, 0, 0, 0.5)` both split to four tokens.
  const parts = body.split(/[\s,/]+/).filter(Boolean);
  const alpha = parts.length === 4 ? num(parts[3]!, 'alpha') : 1;

  if (name.toLowerCase().startsWith('rgb')) {
    const [r, g, b] = parts.slice(0, 3).map(p => num(p, 'channel'));
    if (r === undefined || g === undefined || b === undefined) throw new Error(`Unsupported colour "${input}"`);
    return { r, g, b, a: alpha };
  }

  const [L, C, h] = parts.slice(0, 3);
  if (L === undefined || C === undefined || h === undefined) throw new Error(`Unsupported colour "${input}"`);
  const lightness = L.endsWith('%') ? num(L.slice(0, -1), 'lightness') / 100 : num(L, 'lightness');
  return oklchToRgba(lightness, num(C, 'chroma'), num(h, 'hue'), alpha);
}

/** `#rrggbb` when opaque, otherwise `rgba(r, g, b, a)` — both read by every renderer. */
export function formatColor({ r, g, b, a }: Rgba): string {
  if (a >= 1) return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`;
}
