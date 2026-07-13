---
"@eventuras/ratio-ui": patch
---

**Tokens: lift `--text-subtle` contrast; fix bureau's muted/subtle.**

`--text-subtle` (hints, placeholders, timestamps) sat below WCAG AA in both
modes of the standard theme, and the bureau theme was weaker still — its
light-mode `--text-muted` also failed AA. All tones now meet AA against both
the surface and cards while keeping a clear hierarchy (`text` > `muted` >
`subtle`):

- Standard light: subtle `neutral-500` → `neutral-600` (~4.0:1 → ~6.7:1)
- Standard dark: subtle `secondary-700` → `secondary-600` (~2.6:1 → ~4.8:1 on
  cards)
- Bureau light: muted `#837c6a` → `#5c5644`, subtle `#a79d80` → `#6b6450`
- Bureau dark: subtle `#837c64` → `#938b75`

A new `Tokens/Text tones` story shows the three tones on the surface and on a
card, for judging the hierarchy per theme. Completes the contrast pass started
with the dark `--text-muted` lift.
