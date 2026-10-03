# ADR-0001: A vanilla tier for the design system

## Status

Accepted 2026-10-03.

## Context

Losvik has a React Native app, and it should look like Losvik on the web:
Bureau's paper and navy, the hard shadows, Pixelify Sans. `@eventuras/ratio-ui`
cannot run there — it is built on `react-aria-components`, `react-dom` and
Tailwind, and React Native has none of the three. The values existed only as
~90 custom properties in `themes/bureau.css`; an app could copy hex codes out
of it and nothing more.

A `./themes/bureau` data export inside `ratio-ui` would have been the small
move. But to import it the app installs `ratio-ui`, with `react-dom` as an
unmet peer and `react-aria-components`, `react-stately`, `lucide-react` and
`tailwind-merge` in its `node_modules`, and nothing stops a native component
from reaching a web one by accident. `@eventuras/markdown-core` was cut for
the same reason: a vanilla tier the React tier re-exports, so consumers of
the latter never install the former.

## Decision

A package below both renderers, `@eventuras/ratio-ui-core`, holding what they
must agree on and nothing that renders:

- **Theme values as data**, one file per theme in `themes/`. Values are
  authored as the CSS writes them — `oklch()` stays `oklch()` so the web
  keeps its gamut — and references are references: the hard shadow is
  `mix('text', 0.62)`, not an rgba, because the CSS relies on `var(--text)`
  re-resolving inside `.surface-dark`. `dark` is an overlay on `light`,
  as the cascade is.
- **Two views of one source.** The authored theme, for the generator.
  `resolveTheme()`, for a renderer with no CSS engine: sRGB strings,
  references followed inside their own mode, shadows in parts, radius in
  points. No build step and no dependency — the colour maths ships.
- **The CSS is generated, not moved.** The theme CSS is the web's public
  contract (the template, the authoring guide, third-party themes), so it
  stays where it is and `ratio-ui` will generate it from this data. Until
  that lands the hand-written CSS is the source and a test holds the data
  to it, value for value.
- **The rule**: nothing in this package imports `react`, `react-native` or
  any `@eventuras/ratio-ui*`. eslint and a build guard both enforce it.

The name follows `markdown-core`. It collides with the `./core/*` subpath
of `ratio-ui` — base components there, base tier here — and we live with
that, since the subpath is a public export.

## Consequences

- Semantic tokens and the primary scale first. Component tokens stay
  CSS-only until a renderer needs them; Ink and the standard theme follow
  by the same mechanism.
- `ratio-ui` keeps `./themes/*.css` and `./tokens` as they are. When the
  generator lands, the CSS becomes build output and `./tokens` re-exports
  this vocabulary under its Tailwind builders.
- Shared chat types and the text segmenter are not here yet. They go in a
  `chat/` folder if native chat turns out to need the same model, and
  nowhere if it does not.
- Gamut: OKLCH is clipped per channel, where CSS gamut-maps. Fine for the
  scales we have; revisit if a theme leans on saturated steps.
