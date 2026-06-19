# Authoring a custom theme

ratio-ui themes are plain CSS custom properties. To create your own palette
(colors, rounding, fonts, …) you override a documented set of tokens under a
`data-theme` selector — no build step, no API. This is the same mechanism the
built-in `bureau` theme uses, so [`src/tokens/bureau.css`](../src/tokens/bureau.css)
is a real worked example.

A ready-to-edit starting point ships at
[`src/tokens/theme-template.css`](../src/tokens/theme-template.css) — copy it,
rename, and fill in.

## The two axes

Custom (named) themes use two orthogonal attributes on `<html>`:

| Axis | Attribute | Values | Meaning |
| --- | --- | --- | --- |
| Palette | `data-theme` | `bureau`, your themes… | brand: colors, radii, fonts |
| Light/dark | `data-color-scheme` | `light` \| `dark` | mode, always binary |

```html
<html data-theme="acme" data-color-scheme="light">
```

A named theme with no `data-color-scheme` falls back to its light block.

> **Standard (built-in) theme:** it currently carries mode in the palette
> attribute itself — `data-theme="light"` or `data-theme="dark"` — not on the
> two axes. The themes you author use the two-axis model above; leave the
> standard `light`/`dark` values as they are. (The standard theme is planned
> to move onto `data-color-scheme` too in a future major.)

## Minimum viable theme

You only override what differs from standard — everything else inherits. The
smallest coherent theme defines brand + text + surfaces + borders:

```css
:root[data-theme="acme"] {
  color-scheme: light;
  --primary: #2563eb;
  --accent:  #f59e0b;
  --text:    #111827;
  --surface: #f8fafc;
  --card:    #ffffff;
  --border-1: #e5e7eb;
}
```

Then set `data-theme="acme"`. Done — buttons, cards, badges, inputs, etc. adopt
it because they read these tokens.

## Token contract

Override these under `:root[data-theme="<name>"]` (and the
`[data-color-scheme="dark"]` variant for dark). Anything omitted inherits the
standard theme.

### Brand

| Token | Role |
| --- | --- |
| `--primary` | primary actions, links |
| `--secondary` | secondary surfaces/buttons |
| `--accent` | highlights |
| `--text-on-primary` / `--text-on-secondary` / `--text-on-accent` | text drawn on each brand fill (must contrast it) |

### Text

| Token | Role |
| --- | --- |
| `--text` | body text |
| `--text-muted` | secondary text |
| `--text-subtle` | hints / placeholders |
| `--text-light` / `--text-dark` | fixed light/dark ink (rarely overridden) |

### Surfaces & borders

| Token | Role |
| --- | --- |
| `--surface` | page background |
| `--card` | raised cards/panels |
| `--card-hover` | card hover state |
| `--border-1` | hairline border |
| `--border-2` | stronger border step |
| `--focus-ring` | focus ring color (feeds the focus shadow) |

### Rounding

| Token | Default | Note |
| --- | --- | --- |
| `--radius-sm` | `0.25rem` | drives every `rounded-sm` utility |
| `--radius` | `0.5rem` | `rounded` |
| `--radius-lg` | `0.75rem` | `rounded-lg` |
| `--radius-xl` | `1rem` | `rounded-xl` |

Set them all to `0` for sharp corners, or large values for soft ones.

### Fonts

| Token | Role |
| --- | --- |
| `--font-body` / `--font-sans` | body / sans text |
| `--font-display` | headings |
| `--font-mono` | code / monospace |

**Font-family stacks only.** ratio-ui never loads font files — embed the fonts
in your app (e.g. `@font-face` or a `<link>`).

### Status (optional — 5 tokens each)

`info`, `success`, `warning`, `error`. Per family:
`--<status>-solid`, `--<status>-on-solid`, `--<status>-bg`, `--<status>-border`,
`--<status>-text`. Omit to inherit standard.

### Chip (optional)

`--chip-bg`, `--chip-fg`, `--chip-border`, `--chip-on-solid`, `--chip-radius`.

### Advanced: color scales

The raw Tailwind scales (`--color-primary-50` … `--color-primary-950`, and the
same for `secondary`/`accent`/`neutral`/`success`/`warning`/`error`/`info`/`support`)
are also overridable per `data-theme`, because Tailwind v4 emits them as
`var(--color-*)` in utilities. Most themes only need the semantic tokens above;
override scales when you want `bg-primary-200/50`-style utilities to shift too.

## Dark variant

Add a second block; override only what changes:

```css
:root[data-theme="acme"][data-color-scheme="dark"] {
  color-scheme: dark;
  --surface: #0b0f19;
  --card:    #111827;
  --text:    #f3f4f6;
  --border-1: #1f2937;
}
```

Note on shared token files: the standard-theme dark overrides (e.g.
`theme.css`, `chip.css`, `retro.css`) key to **both** `:root[data-theme="dark"]`
and `:root[data-color-scheme="dark"]`, so they apply on either axis. Named
themes instead scope dark to their own selector, as in the block above. If you
add your own dark-only override for a *shared* token, match the
`data-color-scheme` arm so it triggers on the orthogonal axis too.

## ⚠️ Set `data-theme` early (FOUC)

`global.css` hides `<html>` (`opacity: 0`) until a theme is set, then reveals it
for any `html[data-theme]`. Set `data-theme` **before first paint** — a blocking
inline `<script>` in `<head>` — or the page renders blank/white until your
attribute lands. See [css-exports.md](./css-exports.md).

## Checklist

- [ ] `:root[data-theme="<name>"]` block with `color-scheme: light` + brand/text/surface/border tokens
- [ ] `[data-color-scheme="dark"]` variant overriding what changes
- [ ] fonts embedded in your app (family tokens only)
- [ ] `data-theme` set on `<html>` early (before paint)
- [ ] verified contrast on `--text-on-*` against their fills
