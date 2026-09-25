---
"@eventuras/ratio-ui": minor
---

New `SkipLink` (`core/SkipLink`) for keyboard and screen reader users
(WCAG 2.4.1). Hidden until focused, it slides in at the top of the viewport
and moves focus to the target (default `#main`) when activated. Styled by
new `--skip-link-*` tokens (`tokens/skip-link.css`).

`ThreeColumnLayout` gives its `<main>` `id="main"` (configurable with
`mainId`), so a default `SkipLink` works with it out of the box.
