---
"@eventuras/ratio-ui": minor
---

Two small primitives for editorial outlines (className-free consumers):

- `Text` gains `family` (`'sans' | 'serif' | 'mono'`, from the theme's font
  tokens) and `transform` (`'none' | 'uppercase'` — uppercase bundles a modest
  letter-spacing). Together with `size="xs"` + `variant="subtle"` this is the
  small meta/caption voice (type labels, counts) previously only reachable via
  className. Text prop types are now exported from `core/Text`.
- `Stack` gains `rail` — a `--border-1` hairline down the left edge with a
  matching inset, marking children as one level deeper in a hierarchy
  (outlines, threads, tree levels). Vertical stacks only.
- `Stack` `align` accepts `'baseline'` — for horizontal stacks pairing text at
  different sizes (a title and its caption), so baselines line up instead of
  boxes.
