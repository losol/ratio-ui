# Posters

A notice, an announcement, a post for the feed: a template with named
places, filled with text and pictures, drawn as one SVG that renders on the
server and exports to an image in the browser. The layout is
`@eventuras/ratio-ui-core/posters`, re-exported here so an app needs one
import.

```tsx
import { Poster, POSTER_SIZES, type PosterTemplate } from '@eventuras/ratio-ui/posters';

const notice: PosterTemplate = {
  ...POSTER_SIZES.square,
  color: '#3d8aa0',
  frame: { width: 16, color: '#3d8aa0', inset: 40 },
  slots: {
    body: {
      kind: 'text',
      box: { x: 128, y: 248, width: 824, height: 454 },
      size: { max: 60, min: 26 },
      valign: 'middle',
    },
    signature: {
      kind: 'text',
      box: { x: 128, y: 742, width: 824, height: 70 },
      size: 50,
      align: 'end',
    },
    logo: { kind: 'image', box: { x: 128, y: 852, width: 86, height: 100 } },
  },
};

<Poster
  template={notice}
  content={{
    body: 'Coffee in the canteen at ten.',
    signature: 'The chief executive',
    logo: { src: logoDataUrl, alt: 'Our crest' },
  }}
/>;
```

## What Ratio UI does, and what the app does

Ratio UI lays the poster out, draws it and turns it into an image. Which
templates exist, what the content says, who may make a poster and where
drafts are kept belong to the app. The `Generator example` story shows one
way to put the two together.

## The pieces

| Export | What it is |
| --- | --- |
| `Poster` | Lays out a template with its content and draws it as SVG. `ref` gives the `<svg>`. |
| `PosterSvg` | Draws a layout you made with `layoutPoster`, for an app that checks it first, for example to warn when a text was cut. |
| `posterToBlob` | The `<svg>` (or its markup) as a PNG, JPEG or WebP file, in the browser. `scale` multiplies the size. |
| `posterMarkup` | The `<svg>` as a string, to save or to rasterise on a server. |
| `layoutPoster` | The model: template and content in, layers in pixels out. Also `fitText`, `wrapText`. |
| `POSTER_SIZES` | `square` 1080×1080, `portrait` 1080×1350, `story` 1080×1920, `landscape` 1200×630. |
| `POSTER_SANS` | The default face: Arial and its metric twins, measured from a table. |

## Templates

A template is data: `width`, `height`, `background`, `color`, an optional
`frame`, and `slots` by name. A slot is a box with a kind:

- **`text`**: `size` is a number, or `{ max, min }` to shrink the text
  until it fits the box. `align`, `valign`, `weight`, `lineHeight`,
  `paragraphGap`, `letterSpacing`, `uppercase` and `maxLines` set it.
  A line break in the text starts a new line; an empty line is a gap
  between paragraphs.
- **`image`**: `fit` is `contain` (the default) or `cover`, which fills the
  box and crops.

Slots are drawn in the order they are written, so a picture written first
lies behind the text after it. The frame is drawn last, on top. A slot with
no content is left out.

Several sizes from one design are a function of the app's that returns a
template for a size, as the stories do.

## Fitting text

Text is measured from a table of widths, not in a browser, so the server
and every browser break the same lines. `POSTER_SANS` uses Arial's widths
(Liberation Sans has the same, Helvetica is within a hair), and every
system draws one of them without loading a font. When a text does not fit
at its smallest size it is cut with an ellipsis, and the slot is listed in
the layout's `overflow` and the SVG's `data-overflow`.

For another face, give a `PosterTypeface` with its CSS family, ascent,
descent and a `measure`; `tableMeasure` builds one from a table of widths.

## From a page to a file

```tsx
const svg = useRef<SVGSVGElement>(null);
<Poster ref={svg} template={notice} content={content} />;

const blob = await posterToBlob(svg.current!, { scale: 2 });
```

An SVG drawn as an image loads nothing from outside. System fonts work;
pictures must be `data:` URLs. A picture that is itself SVG keeps its own
scaling: to `cover` its box, give its root
`preserveAspectRatio="xMidYMid slice"`.

On a server, render `Poster` with `renderToStaticMarkup` and draw the
markup with a rasteriser such as resvg, with Liberation Sans or Arial
installed.
