---
"@eventuras/ratio-ui": minor
---

The `tabula` theme: the printed sheet. White sheets in thick petrol frames on a sand page, no rounded corner anywhere, Fira Sans Condensed for the big words and the small print, and no shadow but the soft one under a button. Load `themes/tabula.css` and, for the fonts, `themes/tabula-fonts.css`; set `data-theme="tabula"`.

Three things a theme can now set without touching a component:

- `--input-*` tokens: the paper a field is printed on, its frame and its corner. `TextField` and the bare `Input` read them. `TextField` is unchanged; `Input` takes the same 2px frame as `TextField`, where it had 1px.
- `--eyebrow-*` tokens: the face, size, weight and tracking of `Heading.Eyebrow`.
- `Card.Meta`: the top corners of a card, small print in capitals and the primary colour with one item at each end. With `Card.Footer` a card has something in all four corners.
