# `tabula` theme — specification

Status: **shipped.** `src/themes/tabula.css` (light + dark) and the opt-in
`src/themes/tabula-fonts.css`. Derived from the "Tabula tema" Claude Design
sketch, 2026-10-14.

## Summary

`tabula` is the printed sheet: Latin for a board, a tablet, a form.
Every surface is a white sheet in a thick petrol frame on a sand page, with no
rounded corner anywhere. One condensed grotesk sets the big words and the
small print, in capitals; its wider sibling sets the running text. The theme
is flat: the frames carry the hierarchy, and the only shadow is the soft one
under a button, which goes when the button is pressed.

Sister to Bureau (the same teal, the same Fira Sans) but not a variant of it:
Bureau is paper, ink and hard offset shadows; Tabula is white, petrol and no
shadow at all. **Look only — no tenant content ships in the theme.**

## Loading it

```css
@import '@eventuras/ratio-ui/ratio-ui.css';
@import '@eventuras/ratio-ui/themes/tabula.css';
@import '@eventuras/ratio-ui/themes/tabula-fonts.css'; /* optional: the files */
```

```html
<html data-theme="tabula" data-color-scheme="light">
```

The fonts file declares Fira Sans Condensed (700 and 800) and, through
`bureau-fonts.css`, Fira Sans. Without it the theme falls back to the system
stacks in its font tokens.

## What it changes against the standard theme

| | Standard | Tabula |
| --- | --- | --- |
| Corners | 4–16 px, buttons as pills | 0 everywhere, pills included |
| Frames | 1–2 px, neutral | sheet 10 px, fields 2 px, choices 3 px: the primary |
| Cards | tinted, soft shadow | opaque white sheets, no shadow |
| Shadow | `shadow-xs` / `sm` | soft, on buttons only; none when pressed |
| Press | grows (104 %) | no growing, the shadow goes |
| Fonts | Source Serif 4 + Source Sans 3 | Fira Sans Condensed + Fira Sans |
| Eyebrows | mono, 10.5 px, wide tracking | condensed, 13 px, 800, capitals, primary |
| Labels | 500 | 700 |
| Page | near-white | sand `#e7e1d1` |

## Tokens

Light arm (`:root[data-theme="tabula"]`, also `.surface-light`):

| Token | Value | Note |
| --- | --- | --- |
| `--primary` | `#0b6a78` | petrol; 5.6:1 on the sand, 6.9:1 on the sheet |
| `--secondary` | `#ddf1f4` | ice, the tint |
| `--text` / `--text-muted` / `--text-subtle` | `#1e2a2e` / `#4a5558` / `#5e6a6d` | subtle is derived |
| `--text-on-primary` | `#ffffff` | |
| `--surface` | `#e7e1d1` | sand |
| `--card` / `--card-hover` | `#ffffff` / `#fffcf0` | the sheet, and paper |
| `--border-1` / `--border-2` | `#cfc6b0` / `#0b6a78` | the rule, and the frame |
| `--focus-ring` | `rgb(11 106 120 / 0.4)` | |
| `--card-shadow-*`, `--card-hover-shadow*` | `none` | |
| `--card-featured-border-width` / `-shadow` | `10px` / `none` | the sheet's frame |
| `--button-radius` / `-shadow` / `-shadow-active` / `-transform-active` | `0` / soft / `none` / `none` | |
| every `--radius-*`, `--chip-radius`, `--action-button-radius`, `--menu-*-radius` | `0` | |
| `--input-bg` / `-border-width` / `-border-color` / `-radius` | `#fffcf0` / `2px` / primary / `0` | |
| `--choice-border-width` / `-border-color` / `-border-color-hover` / `-radius` / `-fg` | `3px` / primary / primary / `0` / primary | radio options and tiles |
| `--label-font-weight` | `700` | |
| `--eyebrow-font-family` / `-size` / `-weight` / `-letter-spacing` | display / `0.8125rem` / `800` / `0.06em` | |
| `--font-display`, `--font-serif` | Fira Sans Condensed | |
| `--font-body`, `--font-sans` | Fira Sans | |

The primary scale is the design's own petrol ramp, `#ddf1f4` (50) to
`#042a30` (950), with 700 the light primary and 500 the dark one. `--accent`,
the status families and the mono face inherit the standard theme.

Dark arm (`[data-color-scheme="dark"]`, also `.surface-dark`): primary
`#3e9aa8` (5.0:1 on the sheet), text `#e9e4d6` / `#b8b3a6`, surface `#101c1f`,
card `#172629`, borders `#2d3f43` / `#3e9aa8`, input `#0e1a1d`, no navbar
shadow.

## What Ratio had to learn

A theme is tokens, so three things the sketch styled inline became tokens, with
the standard look as their default:

- **`--input-*`** (`tokens/form.css`): the paper a field is printed on, its
  frame width and colour, its corner. `TextField` and the bare `Input` read
  them.
- **`--eyebrow-*`** (`tokens/eyebrow.css`): the face, size, weight and tracking
  of `Heading.Eyebrow` and `Card.Meta`.
- **`--choice-*`** (`tokens/choice.css`): the frame, corner and resting text of
  a choice box: a `RadioGroup` option, a `ToggleButton` tile. The picked state
  stays the primary fill.
- **`Card.Meta`**: the top corners of a card, the small print in capitals and
  the primary colour, one item at each end. With `Card.Footer` a card has
  something in all four corners: what it is and who it is from at the top,
  the brand mark and the signature at the foot.

`Button` already read its corner, shadow and press from `--button-*`, and
`Card featured` its frame from `--card-featured-*`, so nothing else moved.

## Not in the theme

- A poster block, a flowchart, a rubber stamp: these are the consumer's,
  composed from `Card featured`, `Card.Meta`, `Card.Footer`, `BrandMark` and
  `Heading.Eyebrow`. The stories under *Themes/Tabula* show the composition.
- Capitals on headings. The sketch sets its big words in capitals; the theme
  does not, since a heading is content. Add `uppercase` where a page wants it.
