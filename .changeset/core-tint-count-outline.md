---
"@eventuras/ratio-ui": minor
---

Three small additions to core, all beta:

- `ToggleButton variant="tint"` and `ToggleButtonGroup variant="tints"` — a
  standalone pill whose selected state is a soft fill (`--toggle-tint-bg`,
  `--toggle-tint-border`) and whose text never changes, for toggles inside
  content such as reactions. The group row wraps, is one tab stop, and takes
  any number of selections with `selectionMode="multiple"`.
- `Badge variant="count"` — a small solid pill for a number or a single
  glyph — and `Badge tone="primary" | "accent"`, which colours a badge from
  the brand instead of a status (the same vocabulary as `Heading`).
- `Chip.Dot variant="outline"` — the dot as a ring, for a state that is
  present but inactive, such as "away".
