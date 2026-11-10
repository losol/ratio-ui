// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import {
  fitText,
  layoutPoster,
  POSTER_SIZES,
  posterTypeface,
  posterTypefaces,
  tableMeasure,
  wrapText,
  type MeasureText,
  type PosterTemplate,
  type PosterTextLayer,
} from './index';

// Every character 0.5 em wide: easy widths to reason about.
const half: MeasureText = (text, font) =>
  Array.from(text).length * (0.5 + font.letterSpacing) * font.size;
const bold10 = { size: 10, weight: 'bold' as const, letterSpacing: 0 };

describe('posterTypeface', () => {
  const at100 = { size: 100, weight: 'bold' as const, letterSpacing: 0 };

  it('measures the standard theme\'s body face, Source Sans 3', () => {
    const sans = posterTypeface('Source Sans 3');
    expect(sans.family).toBe('"Source Sans 3", sans-serif');
    // "a": 504 regular, 527 bold, thousandths of an em.
    expect(sans.measure('a', { ...at100, weight: 'regular' })).toBeCloseTo(50.4);
    expect(sans.measure('a', at100)).toBeCloseTo(52.7);
  });

  it('knows the Nordic letters, and adds letter spacing per character', () => {
    const sans = posterTypeface('Source Sans 3');
    expect(sans.measure('ø', at100)).toBeCloseTo(55.5);
    expect(sans.measure('øø', { ...at100, letterSpacing: 0.1 })).toBeCloseTo(131);
  });

  it('has every face the themes ship, each with its own widths', () => {
    const widths = ['Source Sans 3', 'Source Serif 4', 'Fira Sans', 'Fira Sans Condensed'].map(family =>
      posterTypeface(family).measure('Secret Santa', at100),
    );
    expect(new Set(widths).size).toBe(4);
    expect(posterTypeface('Source Serif 4').family).toBe('"Source Serif 4", serif');
    // Condensed is narrower than its full-width sibling.
    expect(widths[3]).toBeLessThan(widths[2]!);
  });

  it('sets an unknown family in its name, measured as Source Sans 3', () => {
    const other = posterTypeface('Comic Neue');
    expect(other.family).toBe('"Comic Neue", sans-serif');
    expect(other.measure('Hello', at100)).toBe(posterTypeface('Source Sans 3').measure('Hello', at100));
  });

  it('gives a theme\'s display and body faces, by default the standard theme\'s', () => {
    expect(posterTypefaces().display.family).toBe('"Source Serif 4", serif');
    expect(posterTypefaces().body.family).toBe('"Source Sans 3", sans-serif');
    const bureau = posterTypefaces({ display: 'Fira Sans', body: 'Fira Sans' });
    expect(bureau.body.family).toBe('"Fira Sans", sans-serif');
  });

  it('measures an unknown character at the average width', () => {
    const measure = tableMeasure('ab', { regular: [400, 600], bold: [400, 600] });
    expect(measure('漢', { size: 10, weight: 'regular', letterSpacing: 0 })).toBe(5);
  });
});

describe('wrapText', () => {
  it('breaks between words to fit the width', () => {
    // 10 characters per line at size 10 in 50 units.
    expect(wrapText('one two three four', 50, bold10, half).map(l => l.text)).toEqual([
      'one two',
      'three four',
    ]);
  });

  it('keeps line breaks, turns empty lines into one gap and collapses spaces', () => {
    const lines = wrapText('\nfirst   line\nsecond\n\n\nnext\n', 200, bold10, half);
    expect(lines).toEqual([
      { text: 'first line', gap: false },
      { text: 'second', gap: false },
      { text: '', gap: true },
      { text: 'next', gap: false },
    ]);
  });

  it('splits a word wider than the box', () => {
    expect(wrapText('abcdefghij', 20, bold10, half).map(l => l.text)).toEqual([
      'abcd',
      'efgh',
      'ij',
    ]);
  });
});

describe('fitText', () => {
  const base = {
    width: 50,
    height: 100,
    weight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 1,
    paragraphGap: 1,
  };

  it('keeps the largest size when the text fits', () => {
    const fitted = fitText('short', { ...base, size: { max: 20, min: 5 } }, half);
    expect(fitted.font.size).toBe(20);
    expect(fitted.overflow).toBe(false);
  });

  it('shrinks to the largest half-unit size that fits', () => {
    const text = 'aaaa bbbb cccc dddd eeee ffff gggg hhhh';
    const fitted = fitText(text, { ...base, size: { max: 40, min: 2 } }, half);
    expect(fitted.overflow).toBe(false);
    expect(fitted.lines.length * fitted.font.size).toBeLessThanOrEqual(100);
    // Half a unit larger no longer fits.
    const larger = fitText(text, { ...base, size: fitted.font.size + 0.5 }, half);
    expect(larger.overflow).toBe(true);
  });

  it('respects maxLines', () => {
    const fitted = fitText('aaaa bbbb', { ...base, size: { max: 20, min: 5 }, maxLines: 1 }, half);
    expect(fitted.lines).toHaveLength(1);
    expect(fitted.font.size).toBeLessThanOrEqual(50 / (9 * 0.5));
  });

  it('cuts with an ellipsis when even the smallest size is too big', () => {
    // At size 10, ten characters a line and room for two lines.
    const fitted = fitText(
      'aaaa bbbb cccc dddd eeee',
      { ...base, height: 20, size: { max: 20, min: 10 } },
      half,
    );
    expect(fitted.overflow).toBe(true);
    expect(fitted.font.size).toBe(10);
    expect(fitted.lines.map(l => l.text)).toEqual(['aaaa bbbb', 'cccc dddd…']);
  });
});

describe('layoutPoster', () => {
  const template: PosterTemplate = {
    ...POSTER_SIZES.square,
    background: '#fafafa',
    color: '#336',
    frame: { width: 16, color: '#3f8aa0', inset: 90 },
    slots: {
      photo: { kind: 'image', box: { x: 0, y: 0, width: 1080, height: 1080 }, fit: 'cover' },
      body: {
        kind: 'text',
        box: { x: 150, y: 300, width: 780, height: 400 },
        size: { max: 64, min: 24 },
        valign: 'middle',
      },
      signature: {
        kind: 'text',
        box: { x: 150, y: 720, width: 780, height: 60 },
        size: 44,
        align: 'end',
        color: '#c00',
      },
    },
  };

  it('draws the background first, the slots in order and the frame on top', () => {
    const layout = layoutPoster(template, {
      photo: { src: 'data:image/png;base64,AAAA', alt: 'A fjord' },
      body: 'Hello',
      signature: 'The mayor',
    });
    expect(layout.layers.map(l => l.kind)).toEqual(['rect', 'image', 'text', 'text', 'rect']);
    expect(layout.layers[0]).toMatchObject({ fill: '#fafafa', width: 1080, height: 1080 });
    // The frame's stroke is centred on its line, so its outer side is at the inset.
    expect(layout.layers[4]).toMatchObject({ x: 98, y: 98, width: 884, stroke: '#3f8aa0', strokeWidth: 16 });
  });

  it('leaves out slots with no content', () => {
    const layout = layoutPoster(template, { body: 'Hello', signature: '  ', photo: null });
    expect(layout.layers.filter(l => l.kind === 'text').map(l => (l as PosterTextLayer).slot)).toEqual([
      'body',
    ]);
  });

  it('places text by alignment, inherits the colour and centres it vertically', () => {
    const layout = layoutPoster(template, { body: 'Hello', signature: 'The mayor' });
    const [body, signature] = layout.layers.filter((l): l is PosterTextLayer => l.kind === 'text');
    expect(body!.color).toBe('#336');
    expect(body!.anchor).toBe('start');
    expect(body!.lines[0]!.x).toBe(150);
    expect(body!.font.size).toBe(64);
    // One line of 64 × 1.15, centred in 400 from y = 300.
    const top = 300 + (400 - 64 * 1.15) / 2;
    expect(body!.lines[0]!.y).toBeGreaterThan(top);
    expect(body!.lines[0]!.y).toBeLessThan(top + 64 * 1.15);
    expect(signature!.color).toBe('#c00');
    expect(signature!.anchor).toBe('end');
    expect(signature!.lines[0]!.x).toBe(930);
  });

  it('shrinks a long text into its box and reports what overflowed', () => {
    const long = 'In this year we want as many as possible to take part. '.repeat(4);
    const fitted = layoutPoster(template, { body: long });
    const body = fitted.layers.find((l): l is PosterTextLayer => l.kind === 'text')!;
    expect(body.font.size).toBeLessThan(64);
    expect(body.overflow).toBe(false);
    for (const line of body.lines) {
      expect(posterTypeface('Source Sans 3').measure(line.text, body.font)).toBeLessThanOrEqual(780);
    }
    expect(fitted.overflow).toEqual([]);

    const tooLong = layoutPoster(template, { body: long.repeat(10) });
    expect(tooLong.overflow).toEqual(['body']);
  });

  it('sets each slot in the theme\'s face for its role', () => {
    const slots: PosterTemplate['slots'] = {
      title: { kind: 'text', box: { x: 0, y: 0, width: 400, height: 100 }, size: 20, font: 'display' },
      body: { kind: 'text', box: { x: 0, y: 100, width: 400, height: 100 }, size: 20 },
    };
    const families = (fonts?: { display: string; body: string }) =>
      layoutPoster({ width: 400, height: 200, slots }, { title: 'A', body: 'B' }, { fonts })
        .layers.filter((l): l is PosterTextLayer => l.kind === 'text')
        .map(l => l.family);
    expect(families()).toEqual(['"Source Serif 4", serif', '"Source Sans 3", sans-serif']);
    expect(families({ display: 'Fira Sans Condensed', body: 'Fira Sans' })).toEqual([
      '"Fira Sans Condensed", sans-serif',
      '"Fira Sans", sans-serif',
    ]);
  });

  it('upper-cases text set as capitals, keeping the source', () => {
    const layout = layoutPoster(
      {
        width: 400,
        height: 100,
        slots: { title: { kind: 'text', box: { x: 0, y: 0, width: 400, height: 100 }, size: 20, uppercase: true } },
      },
      { title: 'drift i adventstid' },
    );
    const title = layout.layers[1] as PosterTextLayer;
    expect(title.lines[0]!.text).toBe('DRIFT I ADVENTSTID');
    expect(title.source).toBe('drift i adventstid');
  });
});
