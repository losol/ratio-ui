// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { bureau } from '@eventuras/ratio-ui-core/themes/bureau';
import { tabula } from '@eventuras/ratio-ui-core/themes/tabula';
import {
  embedPosterFonts,
  layoutPoster,
  Poster,
  POSTER_SIZES,
  posterMarkup,
  posterToBlob,
  posterTypefaces,
  PosterSvg,
  type PosterContent,
  type PosterTemplate,
} from './index';
// The standard theme's faces, as an app loads them. Bureau's and Tabula's
// load with their themes in Storybook's preview.
import '../fonts.css';
import { Button } from '../core/Button';
import { Text } from '../core/Text';
import { TextField } from '../forms/Input/TextField';

const meta: Meta<typeof Poster> = {
  title: 'Visuals/Poster (beta)',
  component: Poster,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof Poster>;

// Everything from here to the stories is the app's side: a template of its
// own, its logo, its content. Ratio UI only lays out and draws.

const TEAL = '#3d8aa0';

/** A placeholder crest: a shield with a wave. An app brings its own logo. */
const crest =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86 100">` +
      `<path d="M3 3h80v52c0 22-18 36-40 42C21 91 3 77 3 55z" fill="${TEAL}"/>` +
      `<path d="M14 52c8-8 16-8 24 0s16 8 24 0 12-6 12-6v10s-4 6-12 6-16-8-24-8-16 8-24 0z" fill="#fff"/>` +
      `<circle cx="43" cy="28" r="10" fill="#fff"/></svg>`,
  );

/**
 * A notice in the municipality's look, for any size: the frame, a header
 * with the episode and the series, the message, who signs it, and the
 * crest with the name. The boxes follow the size; the type does not.
 */
function noticeTemplate({ width, height }: { width: number; height: number }): PosterTemplate {
  const edge = 128;
  const inner = width - edge * 2;
  const footer = height - edge - 100;
  const signature = footer - 40 - 70;
  return {
    width,
    height,
    color: TEAL,
    frame: { width: 16, color: TEAL, inset: 40 },
    slots: {
      code: { kind: 'text', box: { x: edge, y: edge, width: inner / 2, height: 40 }, size: 30 },
      series: {
        kind: 'text',
        box: { x: edge + inner / 2, y: edge, width: inner / 2, height: 40 },
        size: 30,
        align: 'end',
        uppercase: true,
      },
      body: {
        kind: 'text',
        box: { x: edge, y: edge + 120, width: inner, height: signature - 40 - (edge + 120) },
        size: { max: 60, min: 26 },
        lineHeight: 1.08,
        paragraphGap: 0.9,
        valign: 'middle',
      },
      signature: {
        kind: 'text',
        box: { x: edge, y: signature, width: inner, height: 70 },
        size: 50,
        align: 'end',
      },
      crest: { kind: 'image', box: { x: edge, y: footer, width: 86, height: 100 } },
      name: {
        kind: 'text',
        box: { x: edge + 110, y: footer + 4, width: 420, height: 70 },
        size: 32,
        lineHeight: 1,
        uppercase: true,
      },
      motto: {
        kind: 'text',
        box: { x: edge + 110, y: footer + 76, width: 420, height: 20 },
        size: 16,
        uppercase: true,
      },
    },
  };
}

const notice: PosterContent = {
  code: 'SE10EP5',
  series: 'Running the winter',
  body:
    'This year we want as many people as possible in the administration to join the Secret Santa scheme.\n\n' +
    'Could everyone who would like to take part come to the chief executive’s office tomorrow for clarifications and trials?',
  signature: 'The chief executive',
  crest: { src: crest, alt: 'Fjordvik crest' },
  name: 'Fjordvik\nmunicipality',
  motto: 'Steep, salty and stubborn',
};

/** Waits for the faces the poster uses, as the page loads them. */
async function fontsLoaded(svg: Element) {
  const families = new Set([...svg.querySelectorAll('text')].map(text => text.getAttribute('font-family')!));
  await Promise.all(
    [...families].flatMap(family => [document.fonts.load(`400 40px ${family}`), document.fonts.load(`700 40px ${family}`)]),
  );
}

/**
 * Every line must fit its slot and be as wide as it was laid out to be, less
 * kerning: the tables the server measures with, against the font the
 * browser draws.
 */
async function expectLinesMeasured(
  svg: SVGSVGElement,
  template: PosterTemplate,
  fonts?: { display: string; body: string },
) {
  await fontsLoaded(svg);
  const faces = posterTypefaces(fonts);
  for (const text of svg.querySelectorAll<SVGTextElement>('text[data-slot]')) {
    const slot = template.slots[text.dataset.slot!]!;
    if (slot.kind !== 'text') continue;
    const font = {
      size: Number(text.getAttribute('font-size')),
      weight: text.getAttribute('font-weight') === '700' ? ('bold' as const) : ('regular' as const),
      letterSpacing: 0,
    };
    for (const tspan of text.querySelectorAll('tspan')) {
      const drawn = tspan.getComputedTextLength();
      const planned = faces[slot.font ?? 'body'].measure(tspan.textContent ?? '', font);
      await expect(drawn).toBeLessThanOrEqual(slot.box.width + 0.5);
      // Kerning only tightens a line, by a few percent at most; another face
      // standing in for a missing one would miss by more.
      await expect(drawn).toBeLessThanOrEqual(planned + 0.5);
      await expect(drawn).toBeGreaterThan(planned * 0.95);
    }
  }
}

/** A notice: the template above, filled. The same SVG renders on a server. */
export const Notice: Story = {
  render: () => (
    <div style={{ maxWidth: 540 }}>
      <Poster template={noticeTemplate(POSTER_SIZES.square)} content={notice} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const poster = within(canvasElement).getByRole('img');
    await expect(poster).toHaveAccessibleName(/^SE10EP5\. Running the winter\. This year/);
    await expect(poster.getAttribute('aria-label')).toContain('Secret Santa');
    await expect(poster).toHaveAttribute('width', '1080');
    await expect(poster).not.toHaveAttribute('data-overflow');
    await expectLinesMeasured(poster as unknown as SVGSVGElement, noticeTemplate(POSTER_SIZES.square));
  },
};

/**
 * The message shrinks to fit its box, between the slot's largest and
 * smallest size. Past the smallest it is cut with an ellipsis, and the
 * poster names the slot in `data-overflow` for the app to warn about.
 */
export const TextFitsTheBox: Story = {
  render: () => {
    const template = noticeTemplate(POSTER_SIZES.square);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Poster template={template} content={{ ...notice, body: 'Coffee in the canteen at ten.' }} />
        <Poster template={template} content={notice} />
        <Poster
          template={template}
          content={{ ...notice, body: `${notice.body as string}\n\n${notice.body as string}` }}
        />
        <Poster
          template={template}
          content={{ ...notice, body: Array(8).fill(notice.body).join('\n\n') }}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const posters = within(canvasElement).getAllByRole('img');
    const size = (poster: HTMLElement) =>
      Number(poster.querySelector('text[data-slot="body"]')!.getAttribute('font-size'));
    await expect(size(posters[0]!)).toBe(60);
    await expect(size(posters[1]!)).toBeLessThan(60);
    await expect(size(posters[2]!)).toBeLessThan(size(posters[1]!));
    await expect(posters[2]).not.toHaveAttribute('data-overflow');
    await expect(posters[3]).toHaveAttribute('data-overflow', 'body');
    await expect(size(posters[3]!)).toBe(26);
  },
};

/** One template function, three sizes: square for the feed, 4:5, and a story. */
export const Formats: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {(['square', 'portrait', 'story'] as const).map(format => (
        <figure key={format} style={{ margin: 0, width: 220 }}>
          <Poster template={noticeTemplate(POSTER_SIZES[format])} content={notice} />
          <figcaption>
            <Text as="span" size="sm">
              {format}: {POSTER_SIZES[format].width} × {POSTER_SIZES[format].height}
            </Text>
          </figcaption>
        </figure>
      ))}
    </div>
  ),
};

const themes = [
  { name: 'Standard', fonts: undefined },
  { name: 'Bureau', fonts: bureau.font },
  { name: 'Tabula', fonts: tabula.font },
] as const;

/** The notice, with the series in the theme's display face. */
function themedTemplate(): PosterTemplate {
  const template = noticeTemplate(POSTER_SIZES.square);
  const series = template.slots.series;
  if (series?.kind === 'text') template.slots.series = { ...series, font: 'display' };
  return template;
}

/**
 * The text is set in the theme's faces: `fonts` takes a theme's `font`,
 * and a slot picks its `display` or `body` face. The same notice in the
 * standard theme (Source Sans 3, with Source Serif 4 for display), Bureau
 * (Fira Sans) and Tabula (Fira Sans, with Fira Sans Condensed for display).
 * Here the series is set in the display face.
 */
export const ThemeFonts: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
      {themes.map(theme => (
        <figure key={theme.name} style={{ margin: 0 }}>
          <Poster template={themedTemplate()} content={notice} fonts={theme.fonts} />
          <figcaption>
            <Text as="span" size="sm">
              {theme.name}
            </Text>
          </figcaption>
        </figure>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const posters = within(canvasElement).getAllByRole('img');
    const family = (poster: HTMLElement, slot: string) =>
      poster.querySelector(`text[data-slot="${slot}"]`)!.getAttribute('font-family');
    await expect(posters.map(poster => family(poster, 'body'))).toEqual([
      '"Source Sans 3", sans-serif',
      '"Fira Sans", sans-serif',
      '"Fira Sans", sans-serif',
    ]);
    await expect(family(posters[0]!, 'series')).toBe('"Source Serif 4", serif');
    await expect(family(posters[2]!, 'series')).toBe('"Fira Sans Condensed", sans-serif');
    for (const [i, theme] of themes.entries()) {
      await expectLinesMeasured(posters[i] as unknown as SVGSVGElement, themedTemplate(), theme.fonts);
    }
  },
};

/**
 * A misty fjord, drawn here so the story needs no file. A picture that is
 * itself SVG keeps its own scaling, so to `cover` it declares
 * `preserveAspectRatio="xMidYMid slice"` on its root; a photo needs nothing.
 */
const fjord =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">` +
      `<defs><linearGradient id="s" x2="0" y2="1"><stop offset="0" stop-color="#b9d3dc"/><stop offset="1" stop-color="#eef3f2"/></linearGradient></defs>` +
      `<rect width="1600" height="1000" fill="url(#s)"/>` +
      `<path d="M0 620 300 360 520 560 760 300 1060 600 1300 420 1600 640V1000H0z" fill="#7d9ea8"/>` +
      `<path d="M0 760 380 560 640 720 900 540 1200 740 1600 600V1000H0z" fill="#4f7480"/>` +
      `<rect y="820" width="1600" height="180" fill="#2f5560"/></svg>`,
  );

/**
 * Slots are layers, drawn in the order they are written: a picture written
 * first lies behind the text. `cover` fills its box and crops.
 */
export const PictureBehindText: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Poster
        template={{
          ...POSTER_SIZES.portrait,
          color: '#ffffff',
          slots: {
            photo: { kind: 'image', box: { x: 0, y: 0, ...POSTER_SIZES.portrait }, fit: 'cover' },
            title: {
              kind: 'text',
              box: { x: 96, y: 900, width: 888, height: 260 },
              size: { max: 110, min: 48 },
              valign: 'bottom',
              lineHeight: 1,
            },
            note: {
              kind: 'text',
              box: { x: 96, y: 1190, width: 888, height: 60 },
              size: 36,
              weight: 'regular',
            },
          },
        }}
        content={{
          photo: { src: fjord, alt: 'Mountains over a fjord' },
          title: 'The ferry runs again',
          note: 'From Monday, every hour from 06:00',
        }}
      />
    </div>
  ),
};

const STORAGE_KEY = 'ratio-ui:poster-generator-story';
type Draft = { code: string; series: string; body: string; signature: string; format: keyof typeof POSTER_SIZES };
const firstDraft: Draft = {
  code: notice.code as string,
  series: notice.series as string,
  body: notice.body as string,
  signature: notice.signature as string,
  format: 'square',
};

/** The app's part: fields, a draft kept in this browser, a download. */
function Generator() {
  // Persistence is the app's: here the browser keeps the draft.
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...firstDraft, ...(JSON.parse(stored) as Partial<Draft>) };
    } catch {
      // No storage, or something unreadable in it: start from the example.
    }
    return firstDraft;
  });
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // The draft lives as long as the page.
    }
  }, [draft]);

  const template = noticeTemplate(POSTER_SIZES[draft.format]);
  // Laying out first lets the app warn before anyone downloads.
  const layout = layoutPoster(template, { ...notice, ...draft });
  const field = (name: keyof Omit<Draft, 'format'>, label: string, multiline = false) => (
    <TextField
      name={name}
      label={label}
      multiline={multiline}
      rows={multiline ? 7 : undefined}
      value={draft[name]}
      onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(current => ({ ...current, [name]: event.target.value }))
      }
    />
  );

  const download = async () => {
    if (!svg.current) return;
    const blob = await posterToBlob(svg.current);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${draft.code || 'poster'}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 360px) minmax(260px, 480px)', gap: 24 }}>
      <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
        {field('code', 'Episode')}
        {field('series', 'Series')}
        {field('body', 'Message', true)}
        {field('signature', 'Signed')}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['square', 'portrait', 'story'] as const).map(format => (
            <Button
              key={format}
              variant={draft.format === format ? 'primary' : 'outline'}
              size="sm"
              aria-pressed={draft.format === format}
              onClick={() => setDraft(current => ({ ...current, format }))}
            >
              {format}
            </Button>
          ))}
        </div>
        {layout.overflow.length > 0 && (
          <div role="status">
            <Text size="sm">The message is too long for the poster and has been cut.</Text>
          </div>
        )}
        <div>
          <Button variant="primary" onClick={download}>
            Download PNG
          </Button>
        </div>
      </div>
      <PosterSvg layout={layout} label={`${draft.code}. ${draft.body}`} ref={svg} />
    </div>
  );
}

/**
 * A generator, as an app might build one around `Poster`: the fields, the
 * draft kept in this browser and the download are the app's. Ratio UI lays
 * the poster out, draws it and turns it into an image.
 */
export const GeneratorExample: Story = {
  render: () => <Generator />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByLabelText('Message');
    await userEvent.clear(message);
    await userEvent.type(message, 'Lunch is moved to noon.');
    const poster = canvas.getByRole('img');
    await waitFor(() =>
      expect(poster.querySelector('text[data-slot="body"]')?.textContent).toBe('Lunch is moved to noon.'),
    );
    await expect(canvas.queryByRole('status')).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'story' }));
    await expect(poster).toHaveAttribute('height', '1920');

    // The file carries the theme's face, so it draws the same anywhere.
    const file = await embedPosterFonts(posterMarkup(poster as unknown as SVGSVGElement));
    await expect(file).toMatch(/<style>@font-face\{font-family:\s*"Source Sans 3";[^}]*src:url\("data:/);

    const blob = await posterToBlob(poster as unknown as SVGSVGElement);
    await expect(blob.type).toBe('image/png');
    const bitmap = await createImageBitmap(blob);
    await expect([bitmap.width, bitmap.height]).toEqual([1080, 1920]);
  },
};
