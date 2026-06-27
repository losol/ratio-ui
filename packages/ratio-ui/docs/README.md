# Ratio UI Documentation

This directory contains design and implementation notes for
`@eventuras/ratio-ui`. Component examples live in Storybook next to the source;
these docs cover package-level contracts and decisions.

## Guides

| Document | Purpose |
| --- | --- |
| [`css-exports.md`](css-exports.md) | Explains the CSS entry points and when to use each one. |
| [`authoring-themes.md`](authoring-themes.md) | Describes the custom theme contract and required tokens. |
| [`bureau-theme-spec.md`](bureau-theme-spec.md) | Captures the Bureau theme direction and token choices. |
| [`autocomplete-api-design.md`](autocomplete-api-design.md) | Records the Autocomplete API design notes. |

## Architecture Decisions

| ADR | Purpose |
| --- | --- |
| [`adr/0001-spacing-borders-colors.md`](adr/0001-spacing-borders-colors.md) | Documents the spacing, border, and color token decision. |

## Where To Document New Work

- Use Storybook stories for common examples, variants, and visual states.
- Add a component-level `README.md` beside the component when setup, API shape,
  or integration details need prose.
- Add a file here for package-level contracts such as CSS entry points, tokens,
  theming, accessibility patterns, or larger design decisions.
- Add an ADR under `adr/` when a decision should remain understandable after the
  implementation details have changed.
