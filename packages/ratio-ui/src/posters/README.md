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
| `embedPosterFonts` | The markup with the page's faces inside, so the file draws the same anywhere. |
| `layoutPoster` | The model: template and content in, layers in pixels out. Also `fitText`, `wrapText`. |
| `POSTER_SIZES` | `square` 1080×1080, `portrait` 1080×1350, `story` 1080×1920, `landscape` 1200×630. |
| `posterTypefaces` | A theme's display and body faces, from its `font`, measured from tables. |

## Templates

A template is data: `width`, `height`, `background`, `color`, an optional
`frame`, and `slots` by name. A slot is a box with a kind:

- **`text`**: `size` is a number, or `{ max, min }` to shrink the text
  until it fits the box. `font` picks the theme's `display` or `body`
  face (the default). `align`, `valign`, `weight`, `lineHeight`,
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

## The theme's faces

Text is set in the theme's faces. `fonts` takes a theme's `font`; without
it, the poster uses the standard theme's, Source Serif 4 for display and
Source Sans 3 for body:

```tsx
import { bureau } from '@eventuras/ratio-ui-core/themes/bureau';

<Poster template={notice} content={content} fonts={bureau.font} />;
```

The page loads the faces as the theme does: `@eventuras/ratio-ui/fonts.css`
for the standard theme, `themes/bureau-fonts.css` or
`themes/tabula-fonts.css` for the others.

## Fitting text

Text is measured from tables of the widths of every face the themes ship
(Source Sans 3, Source Serif 4, Fira Sans, Fira Sans Condensed), not in a
browser, so the server and every browser break the same lines. A browser
draws a line a little narrower (kerning) or, where it rounds glyphs to
whole pixels, up to a percent or two wider, so each text box keeps 2%
spare (`POSTER_TEXT_SPARE`). Regular is weight 400 and bold 700. Source Serif 4 is drawn at its
default optical size (`font-optical-sizing: none`), as it is measured.

When a text does not fit at its smallest size it is cut with an ellipsis,
and the slot is listed in the layout's `overflow` and the SVG's
`data-overflow`.

A family the tables do not know is set in its own name but measured as
Source Sans 3. For another face, give `typefaces` with its CSS family,
ascent, descent and a `measure`; `tableMeasure` builds one from a table of
widths.

## From a page to a file

```tsx
const svg = useRef<SVGSVGElement>(null);
<Poster ref={svg} template={notice} content={content} />;

const blob = await posterToBlob(svg.current!, { scale: 2 });
```

An SVG drawn as an image loads nothing from outside, so `posterToBlob`
copies the page's `@font-face` rules for the poster's faces into it, each
file as a `data:` URL. Pictures must be `data:` URLs. A picture that is
itself SVG keeps its own scaling: to `cover` its box, give its root
`preserveAspectRatio="xMidYMid slice"`.

On a server, render `Poster` with `renderToStaticMarkup` and draw the
markup with a rasteriser such as resvg, given the theme's font files.
