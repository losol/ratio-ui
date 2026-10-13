/** A colour in sRGB: channels 0–255, alpha 0–1. */
export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}
/**
 * OKLCH → sRGB, by Björn Ottosson's matrices. Out-of-gamut colours are
 * clipped per channel; CSS gamut-maps instead, so a step at the edge of
 * sRGB can land a notch off what the browser shows.
 */
export declare function oklchToRgba(L: number, C: number, h: number, a?: number): Rgba;
/**
 * Reads the forms the themes are written in: `#rgb[a]`, `#rrggbb[aa]`,
 * `rgb()`/`rgba()` with commas or spaces, and `oklch()`. Anything else
 * throws — a theme value nobody can parse is a bug, not a fallback.
 */
export declare function parseColor(input: string): Rgba;
/** `#rrggbb` when opaque, otherwise `rgba(r, g, b, a)` — both read by every renderer. */
export declare function formatColor({ r, g, b, a }: Rgba): string;
//# sourceMappingURL=color.d.ts.map