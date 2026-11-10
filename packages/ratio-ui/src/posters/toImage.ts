// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// From a poster on the page to a file: the SVG drawn onto a canvas, in the
// browser. On a server, draw the same SVG with a rasteriser such as resvg.
//
// An SVG drawn as an image loads nothing: system fonts work (POSTER_SANS is
// Arial and its twins), a web font or a picture must be inside the SVG,
// pictures as `data:` URLs.

export interface PosterImageOptions {
  /** `image/png` (default), `image/jpeg` or `image/webp`. */
  type?: string;
  /** Multiplies the poster's own pixel size. Default 1. */
  scale?: number;
  /** For JPEG and WebP, 0–1. */
  quality?: number;
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
  { type = 'image/png', scale = 1, quality }: PosterImageOptions = {},
): Promise<Blob> {
  const markup = posterMarkup(svg);
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

/** The root's `width` and `height`, which `Poster` always writes. */
function sizeOf(markup: string): { width: number; height: number } {
  const root = markup.match(/<svg\b[^>]*>/)?.[0] ?? '';
  const read = (name: string) => Number(root.match(new RegExp(`\\s${name}="([\\d.]+)"`))?.[1]);
  const width = read('width');
  const height = read('height');
  if (!(width > 0 && height > 0)) throw new Error('posterToBlob: the <svg> needs a width and a height');
  return { width, height };
}
