# `bureau` theme — specification

Status: **in progress (PR #6).** Round-1 tokens shipped: `bureau.css` (light + dark) wired into the token bundle, and the light/dark axis "expand" step landed (standard dark tokens respond to `data-color-scheme="dark"`). Still pending: chrome utilities, the window-frame component, fonts opt-in, the consumer migration, and the breaking "contract" step. Naming + architecture agreed 2026-06-14; verified against the repo 2026-06-18.

## Summary

`bureau` is the first named theme for ratio-ui: a "moderne retro" / retro-bureaucratic look — paper, rubber stamps, navy/ochre/brick, Win95/DOS heritage, hard offset shadows. It plugs into the existing `data-theme` mechanism so existing components adopt it automatically through semantic-token overrides.

Derived from the K4 iteration of a Claude Design handoff bundle ("Ratio UI Design System" project). **Look only — no tenant content** ships in the theme.

## Settled decisions

- **Name = `bureau`.** Rejected `retro` (too vague; the green-CRT palette already owns "retro").
- **Plug in via `data-theme`.** `[data-theme="bureau"]` overrides the semantic `var()` tokens globally — same pattern as `[data-theme="dark"]` — so existing Button/Badge/Card adopt it with no component changes.
- **Ships a dark variant**, based on K4's `.neo--dark` palettes.
- **CRT is a tilvalg, not a theme.** Keep the green-phosphor palette in `tokens/retro.css` (`--retro-*` + `.retro-scanlines`, consumed by Console), but reframe it as an opt-in surface class on a container — decoupled from being "the theme".
- **Fonts as tokens only.** The theme defines font-family stacks (Pixelify Sans / Space Mono / Archivo) as CSS vars; the consumer embeds the font files. Ship an optional `@font-face` snippet, do not load fonts from the bundle.
- **Round-1 scope = tokens + core chrome only**: palette, fonts, shadow/stamp utilities, window frame + button + status pill. NOT table/timeline/metadata-grid (round 2). NOT demo toys (IRC client, game, oppslagstavle) — never as library components.
- **No tenant/KAOS/Losvik content** anywhere in the theme.

## Light/dark architecture (resolved — clean split)

**Decided 2026-06-18: two universal orthogonal axes for EVERY theme, including standard.** This supersedes the earlier hybrid plan (which kept the compound `data-theme="dark"` as an alias). Reaching the clean model is breaking for the consumer → ships as a **major version**, coordinated with eventuras.

Axis naming follows prior art (Primer/MUI/Mantine/CSS):

- **light/dark axis = `data-color-scheme`** (matches the CSS `color-scheme` property; chosen over `data-mode`). Always binary, applies to every theme.
- **palette/brand axis = `data-theme`** — `standard` (default), `bureau`, … dropdown-friendly. Carries palette ONLY, never mode.

Rules:

- **All themes use both axes**: `data-theme="standard|bureau|…"` + `data-color-scheme="light|dark"`. The standard theme's dark stops being a *value* of `data-theme` and becomes `data-color-scheme="dark"`.
- A theme element with no `data-color-scheme` falls back to light.
- Also set the native CSS `color-scheme: light|dark` alongside, so browser chrome (scrollbars, form controls, `light-dark()`) follows for free.

Why dark is more entangled than plain tokens: the Tailwind `dark:` variant is bound via `@custom-variant dark` in both `packages/ratio-ui/src/global.css:41` and `packages/ratio-ui/src/components.css:11`; the standard theme's semantic-token swap lives in `theme.css` under `:root[data-theme="dark"]`. The web app owns the attributes via its `ThemeProvider` / `InitTheme`.

**Migration strategy — expand → migrate consumer → contract** (so no single breaking big-bang):

1. **Expand (non-breaking, done in PR #6):** make `data-color-scheme="dark"` *also* trigger dark, alongside the legacy `data-theme="dark"`. Two parts, both landed: (a) the `@custom-variant dark` in `global.css` + `components.css` now matches `[data-color-scheme="dark"]`, so `dark:` utilities respond; (b) the standard-theme semantic-token swaps now respond too — `:root[data-color-scheme="dark"]` was added alongside `:root[data-theme="dark"]` in `theme.css`, `chip.css`, and `retro.css`. Any token file that adds a `:root[data-theme="dark"]` override must add the `data-color-scheme` arm as well, or consumers on the new axis get mismatched tokens in dark mode.
2. **Migrate consumer:** update eventuras `ThemeProvider`/`InitTheme` to write `data-theme="standard"` + `data-color-scheme` for the light/dark toggle (instead of `data-theme="dark"`).
3. **Contract (breaking, major):** drop the `data-theme="dark"` arm from `@custom-variant dark` and rename the `theme.css` dark block selector to `:root[data-color-scheme="dark"]`. One convention remains.

## Baseline — how theming works today

Verified 2026-06-18 in `packages/ratio-ui/src/tokens/`:

- `theme.css`: `@theme {}` holds oklch color *scales* (Tailwind v4, build-time). Semantic tokens are `var()` refs in `:root {}` (line ~200), swapped in `:root[data-theme="dark"] {}` (line ~271). Dark is a *value* of the single `data-theme` attribute.
- `typography.css`: `--font-sans` (`"Source Sans 3"…`), `--font-mono`, `--font-display` (= `--font-serif`), `--font-body` (= `--font-sans`), fluid `--font-size-*`.
- `border.css`: `--radius-sm` / `--radius` / `--radius-lg` / `--radius-xl`.
- `index.css`: imports all token files (theme, typography, spacing, border, chip, action-button, live-indicator, retro).
- `retro.css`: green-phosphor `--retro-*` palette + `.retro-scanlines`, consumed by Console's `--theme-retro` variant.
- `global.css:41` + `components.css:11`: `@custom-variant dark (&:where(html[data-theme="dark"] &, body[data-theme="dark"] &, [data-theme="dark"] *));`

## Files to change

1. **NEW `packages/ratio-ui/src/tokens/bureau.css`** — `[data-theme="bureau"]` (light) and `[data-theme="bureau"][data-color-scheme="dark"]` (dark) overriding semantic tokens + radii + font tokens, plus chrome utilities (hard-shadow, stamp, press-down). Specificity handles the override; a bureau element with no `data-color-scheme` falls back to bureau light.
2. **`packages/ratio-ui/src/tokens/index.css`** — add `@import "./bureau.css";`.
3. **NEW `packages/ratio-ui/src/tokens/bureau-fonts.css`** — optional `@font-face` for Pixelify Sans / Space Mono / Archivo. **Not** imported by `index.css`; documented as consumer opt-in (theme ships font-family tokens only; consumer embeds the files).
4. **`packages/ratio-ui/src/tokens/retro.css`** — leave functionally as-is for round 1 (Console depends on it); reframe in comments as the *CRT tilvalg surface*, not a theme. Optional later: rename to `crt.css` + expose a `.crt` surface opt-in class.
5. **`global.css:41` + `components.css:11`** — *expand step (PR 1, done):* additive edit to `@custom-variant dark` to also match `[data-color-scheme="dark"] *`, keeping the legacy `[data-theme="dark"]` arms. Non-breaking. *Follow-up expand:* add `:root[data-color-scheme="dark"]` to the `theme.css` dark block so standard-theme semantic tokens swap on the new axis. *Contract step (major):* drop the `[data-theme="dark"]` arms. See the migration strategy above.
6. **Core chrome** — existing Button/Badge/Card auto-adopt via token overrides (square radii + hard shadow + press-down `:active`, scoped under `[data-theme="bureau"]`). One NEW bureau window-frame component (titlebar with square dots + monospace path + toolbar slot + statusbar) — likely `core/` or `blocks/`. Status pill = Badge with bureau token values.
7. **Consumer (web app `ThemeProvider` / `InitTheme`)** — *clean split:* write two attrs for ALL themes — `data-theme="standard|bureau|…"` (palette) + `data-color-scheme="light|dark"` (mode). The standard light/dark toggle now writes `data-color-scheme`, NOT `data-theme="dark"`. Extend the `Theme` type to separate palette from color scheme. This is the breaking consumer change → coordinate with the ratio-ui major.

## Token mapping — light (K4 `.kmr` → ratio-ui semantic)

| Semantic token | Value | Notes |
| --- | --- | --- |
| `--primary` | navy `#20304d` | |
| `--text-on-primary` | `#f4efe2` | |
| `--accent` | ochre `#f0b429` | |
| `--surface` (page) | paper `#e6e0d1` | |
| `--card` | `#fffdf7` | |
| `--card-hover` | slightly warmer | |
| `--border-1` | `#ddd6c5` | |
| `--border-2` | navy `#20304d` | |
| `--text` | `#20242c` | |
| `--text-muted` | `#837c6a` | |
| `--text-subtle` | `#a79d80` | |
| `--error-*` family | brick `#b53026` | haster/avvik |
| `--focus-ring` | navy @ ~45% alpha | |
| `--radius-sm/–/lg` | ~2px / 3px / 4px | no `rounded-full` |
| `--font-display` | "Pixelify Sans" | |
| `--font-body` | "Archivo" | |
| `--font-mono` | "Space Mono" | |
| NEW `--shadow-hard` | `Npx Npx 0 var(--primary)` | offset, no blur; `:active` = translate + shadow gone |

## Token mapping — dark (K4 `.neo--dark`)

| Role | Value |
| --- | --- |
| paper / bg | `#14140f` |
| card | `#20231b` |
| field | `#181a13` |
| ink / text | `#f0e7d2` |
| muted | `#a39c86` |
| blue / primary | `#6c8bff` |
| gold / accent | `#ffc23d` |
| teal | `#2fd0b6` |
| coral / error | `#ff6e52` |

## Visual character

- Tighter radii (2–3px, not rounded-full).
- Hard offset shadows: `Npx Npx 0` with no blur.
- `:active` = translate + shadow-gone ("press down").

## Conventions to follow when executing

- Add a `.changeset/*.md` (publishable `@eventuras/*` package); keep it terse.
- Follow the ratio-ui compound-component pattern (`Object.assign(Root, { Sub })`); named exports; no `'use client'`; colocate tests.
- No tenant/Losvik/KAOS content in the theme.
- Branch + PR, never push main.

---

> **Note:** ratio-ui now lives in its own repo (`/Users/ole/Kode/ratio-ui`, monorepo `packages/ratio-ui/`) and is consumed by eventuras from npm as `@eventuras/ratio-ui`. The original plan referenced `libs/ratio-ui/src/tokens/…` paths from the old eventuras monorepo location — those have moved to `packages/ratio-ui/src/tokens/…` here.
