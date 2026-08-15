# ADR-0002: One syntax per token utility

## Status

Accepted 2026-08-16

## Context

The `@theme` block in `tokens/theme.css` defines 39 aliases of the form
`--color-card: var(--card)`. They exist so Tailwind emits utilities for the
semantic tokens — but the arbitrary-value form reads the same tokens directly,
so every color can be written two ways with identical output:

```
bg-card              ← canonical (via the alias)
bg-(--card)          ← arbitrary (reads the token directly)
```

With both doors open the codebase drifted into a mix: 615 utility sites, ~88 %
following one pattern and 75 deviating. The drift was not random — people wrote
`bg-card` because it reads well, and `text-(--text-muted)` because
`text-text-muted` stutters.

## Decision

Codify the majority pattern; enforced by `scripts/check-token-syntax.mjs` in
the package build (same pattern as `check-client-statics.mjs`). The script
reads the alias list from `theme.css`, so new tokens are covered automatically.

- **Canonical** when the alias reads as a color name:
  `bg-card`, `bg-surface`, `border-border-1`, `bg-success`, `text-error-text`.
- **Arbitrary** when the canonical form stutters or shadows a scale:
  - the `text-*` tokens — `text-(--text-muted)`, never `text-text-muted`
  - the brand tokens `primary` / `secondary` / `accent` — `text-(--primary)`,
    since `text-primary` reads like a step on the `primary-*` scale.

`shadow-*` is out of scope: `shadow-card-hover` resolves `--shadow-card-hover`,
a shadow token, not a color alias.

The aliases stay: they are what make the canonical form work, and they are
convenient for consumer app code. The `var()` tokens documented in
[authoring-themes.md](../authoring-themes.md) remain the theme-authoring
contract.

## Consequences

- 75 mechanical fixes across 18 files (36 in stories), applied with `--fix`.
- Component code has one voice per token; grep for a token finds every use.
- The v3.0 contract step (ADR pending; see bureau-theme-spec.md) can land on a
  codebase where token syntax is a settled non-issue.
