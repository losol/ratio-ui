---
"@eventuras/ratio-ui": minor
---

New `SectionNav` in `core/` — the second row of a detail page's navigation: a
sticky strip of section anchors under the site navbar, mono-uppercase links in
`--text-subtle` with the section being read lifted to `--text` and marked
`aria-current="location"`. `top` takes px or any CSS length
(`"calc(var(--spacing) * 16)"` under an `h-16` navbar) and the row measures
its own bottom edge for the scroll-spy (`useActiveSection`), re-measured on
resize. Items are `{ id, title }`; `track: false` keeps a link — say, to a
registration card in the sticky aside — out of the spy. Lines up with
`Navbar`'s centered `container`; `fluid` for app shells. Name the landmark.

`NavList` is deprecated in its favour (forced `LinkComponent`, `top-0` under
a `z-50` navbar, no current state, no label) and will be removed in 3.0.
