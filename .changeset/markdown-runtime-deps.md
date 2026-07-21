---
'@eventuras/markdown': minor
---

Move the markdown engine into runtime dependencies, and name its component type.

- `react-markdown`, `rehype-raw`, `rehype-sanitize` and `remark-gfm` move from
  peer to regular dependencies. They are internal implementation — the component
  builds its own render pipeline and shares no instance across the package
  boundary — so consumers no longer have to install them by hand. Only `react`,
  `react-dom` and `@eventuras/ratio-ui`, which genuinely need one shared copy,
  remain peers.
- New exported type `MarkdownComponents` for `customComponents`. It is
  react-markdown's `Components` (plus custom element names from remark plugins),
  aliased so consumers import it from this package instead of reaching into
  react-markdown, and so the name survives a future change of renderer.
