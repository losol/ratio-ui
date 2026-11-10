// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// From a poster on the page to a file: the SVG drawn onto a canvas, in the
// browser. On a server, draw the same SVG with a rasteriser such as resvg,
// with the theme's font files at hand.
//
// An SVG drawn as an image loads nothing from outside, so the theme's faces
// go inside it: each `@font-face` the page has for a family the poster
// uses is copied in, its file as a `data:` URL. Pictures must be `data:`
// URLs already.

export interface PosterImageOptions {
  /** `image/png` (default), `image/jpeg` or `image/webp`. */
  type?: string;
  /** Multiplies the poster's own pixel size. Default 1. */
  scale?: number;
  /** For JPEG and WebP, 0–1. */
  quality?: number;
  /** Copy the page's faces into the image. Default true. */
  embedFonts?: boolean;
}

/** The poster's SVG, as markup: from the element on the page, or as given. */
export function posterMarkup(svg: SVGSVGElement | string): string {
  if (typeof svg === 'string') return svg;
  return new XMLSerializer().serializeToString(svg);
}

/**
 * The poster as an image file, in the browser. Takes the `<svg>` that
 * `Poster` drew (its `ref`), or its markup.
 */
export async function posterToBlob(
  svg: SVGSVGElement | string,
  { type = 'image/png', scale = 1, quality, embedFonts = true }: PosterImageOptions = {},
): Promise<Blob> {
  let markup = posterMarkup(svg);
  if (embedFonts) markup = await embedPosterFonts(markup);
  const { width, height } = sizeOf(markup);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('posterToBlob: no 2D canvas');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('posterToBlob: the canvas gave no image'))),
        type,
        quality,
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * The markup with the page's `@font-face` rules for its families inside, in
 * a `<style>` after the root's opening tag: an SVG file that draws in the
 * theme's faces wherever it is opened. A face whose file cannot be read is
 * left out, and the image falls back as the page would.
 */
export async function embedPosterFonts(markup: string): Promise<string> {
  const families = new Set(
    [...markup.matchAll(/font-family="([^"]*)"/g)]
      .flatMap(match => decode(match[1]!).split(','))
      .map(name => name.trim().replace(/^["']|["']$/g, '').toLowerCase())
      .filter(Boolean),
  );
  const rules = fontFaceRules().filter(rule =>
    families.has(rule.style.getPropertyValue('font-family').trim().replace(/^["']|["']$/g, '').toLowerCase()),
  );
  const faces = await Promise.all(rules.map(embedded));
  const css = faces.filter(Boolean).join('\n');
  if (!css) return markup;
  return markup.replace(/<svg\b[^>]*>/, open => `${open}<style>${css}</style>`);
}

/** Every `@font-face` on the page, through `@import` and `@media`. */
function fontFaceRules(): CSSFontFaceRule[] {
  const found: CSSFontFaceRule[] = [];
  const walk = (rules: CSSRuleList | undefined) => {
    for (const rule of rules ?? []) {
      if (rule instanceof CSSFontFaceRule) found.push(rule);
      else if (rule instanceof CSSImportRule) walk(readable(rule.styleSheet));
      else if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of document.styleSheets) walk(readable(sheet));
  return found;
}

/** A sheet's rules, or nothing for one from another origin. */
function readable(sheet: CSSStyleSheet | null): CSSRuleList | undefined {
  try {
    return sheet?.cssRules;
  } catch {
    return undefined;
  }
}

/** The rule again, its first file inlined; `null` if the file cannot be read. */
async function embedded(rule: CSSFontFaceRule): Promise<string | null> {
  const source = rule.style.getPropertyValue('src');
  const path = source.match(/url\(\s*["']?([^"')]+)["']?\s*\)/)?.[1];
  if (!path) return null;
  try {
    const base = rule.parentStyleSheet?.href ?? document.baseURI;
    const response = await fetch(new URL(path, base));
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const descriptors = ['font-family', 'font-weight', 'font-style', 'font-stretch', 'unicode-range']
      .map(name => [name, rule.style.getPropertyValue(name)] as const)
      .filter(([, value]) => value)
      .map(([name, value]) => `${name}:${value};`)
      .join('');
    return `@font-face{${descriptors}src:url("${dataUrl}");}`;
  } catch {
    return null;
  }
}

/** Undoes the attribute escaping of XMLSerializer and React. */
function decode(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&');
}

/** The root's `width` and `height`, which `Poster` always writes. */
function sizeOf(markup: string): { width: number; height: number } {
  const root = markup.match(/<svg\b[^>]*>/)?.[0] ?? '';
  const read = (name: string) => Number(root.match(new RegExp(`\\s${name}="([\\d.]+)"`))?.[1]);
  const width = read('width');
  const height = read('height');
  if (!(width > 0 && height > 0)) throw new Error('posterToBlob: the <svg> needs a width and a height');
  return { width, height };
}
