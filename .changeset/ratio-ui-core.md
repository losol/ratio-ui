---
'@eventuras/ratio-ui-core': minor
---

New package: the design system as data — the vanilla tier of the family, with no React,
no DOM and no CSS (ADR-0001).

- `themes/bureau`: Bureau's semantic tokens and primary scale as authored in
  `ratio-ui/src/themes/bureau.css`, references kept as references (`mix('text', 0.62)`),
  `dark` as an overlay on `light`. A test holds the data to the CSS, value for value, until
  `ratio-ui` generates that CSS from here.
- `resolveTheme()`: the view for a renderer without a CSS engine — sRGB hex and rgba,
  references followed inside their own mode, shadows in parts, radius in points. The colour
  maths (`parseColor`, `oklchToRgba`, `formatColor`) ships; no dependencies.
- `defineTheme`, `mix`, `toCssValue`, `cssName`: the schema and the seed of the generator.
