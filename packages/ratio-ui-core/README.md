# @eventuras/ratio-ui-core

The design system as data — the vanilla tier of the `@eventuras/ratio-ui*`
family. **No React, no DOM, no CSS.** Theme values, the token vocabulary, and
the pure rules every renderer must agree on. A build guard fails on any
import of `react`, `react-native` or a `@eventuras/ratio-ui*` package.

**Beta.** The schema, the values and the `chat` rules may still change;
pin a version.

The web renderer is [`@eventuras/ratio-ui`](../ratio-ui); it will generate its
theme CSS from this package. A React Native renderer reads it directly.

## Installation

```bash
pnpm add @eventuras/ratio-ui-core
```

## Usage

A theme is authored once, with references where the CSS has them:

```ts
import { bureau } from '@eventuras/ratio-ui-core/themes/bureau';

bureau.light.primary;          // '#006a7d'
bureau.components.card.shadow.xs; // [{ x: 2, y: 2, blur: 0, color: { ref: 'text', alpha: 0.62, … } }]
bureau.radius.md;              // 3
bureau.font.display;           // 'Fira Sans'
```

A renderer without a CSS engine takes the resolved view — sRGB strings,
references followed inside their own mode, and the component tokens per
mode, every shadow layer in parts:

```ts
import { resolveTheme } from '@eventuras/ratio-ui-core';

const theme = resolveTheme(bureau);
theme.components.light.card.shadow.xs[0].color; // 'rgba(32, 36, 44, 0.62)'   — the dark ink
theme.components.dark.card.shadow.xs[0].color;  // 'rgba(240, 231, 210, 0.62)' — the cream ink
theme.scale.primary[700];      // '#006a7d' — step 700 is the light arm's teal
theme.space.m;                 // 21 — points
```

`toCssValue` writes any value the way the web's CSS does
(`color-mix(in srgb, var(--text) 62%, transparent)`); it is the seed of the
theme generator.

## What is here, and what is not

- **Themes** in `themes/`: Bureau today — semantic tokens with all four
  status families, the chat's colours (`chatNick`, `chatMentionBg`, …;
  beta), the primary and accent scales, and the button, card and chat
  shadow tokens (`theme.components`). The rest of the component tokens
  (`--menu-*` and the like) stay in the CSS until a renderer needs them. Ink and the
  standard theme follow by the same mechanism.
- **Shared scales**: `fontSize` and `space`, the web's fluid sizes as the
  two ends of their `clamp()`. `resolveTheme()` gives them in points at
  the small end, a phone's.
- **Chat** in `@eventuras/ratio-ui-core/chat` (beta): the message's shape
  (`ChatLogMessage`, `ChatReaction`, `ChatLinkPreview`, `ChatRole`) and
  the rules every renderer reads it by — `segmentChatText` for links and
  mentions, `sameNick`/`mentionsNick`, and `hostOf`/`previewLabel`/
  `hasPreviewContent` for link previews. The web's `Chat.Log` uses them
  and `ChatLog` in `@eventuras/ratio-ui-native` both use them.
- **Badges** in `@eventuras/ratio-ui-core/badges` (beta): an Open Badges
  3.0 credential's shape (`OpenBadgeCredential`, `OBAchievement`,
  `OBProfile`, …), `defineAchievement`/`defineCredential`/`defineProfile`
  to build one with the `type` and `@context` filled in,
  `isOpenBadgeCredential` for the shape (not the signature), the look of
  the medallion (`BadgeDisplay`, `BadgeTier`, `BadgeState`), and
  `bakeSvg`/`bakePng` with their `unbake` twins, which put a credential
  inside its picture the way the spec says. No signing: a `proof` is
  carried, never made or checked. See
  [docs/adr/0002-open-badges.md](docs/adr/0002-open-badges.md).
- **Effects** in `@eventuras/ratio-ui-core/fx` (beta): the model behind
  confetti and the like, with nothing that draws. Particles that carry
  their own physics (`FxParticle`, `stepParticles`, `particleOpacity`),
  seeded randomness so a burst is the same burst everywhere (`fxRandom`),
  the effects themselves (`confetti`, `sparkles`, `fireworks`, and
  `lightning` as a strike laid out in time, with `shakeOffset`), their colours
  (`resolveFxColors`, `tierPalette` for a badge's metal), and the rules
  every renderer obeys: `fxMotion`/`fxAllowance` for the reader's
  `prefers-reduced-motion` and the page's `data-motion="none"`, and
  `admitFlash`/`flashOpacity`, which hold any flash of the page to three a
  second and under white-out. See [docs/adr/0003-fx.md](docs/adr/0003-fx.md).
- **The schema**: `defineTheme`, `mix`, `Theme` and friends.
- **Colour maths**: `parseColor`, `oklchToRgba`, `formatColor`. Out-of-gamut
  OKLCH is clipped, not gamut-mapped as CSS does — a step at the edge of
  sRGB can land a notch off.

Until the generator lands, `ratio-ui/src/themes/bureau.css` is the web's
source and `themes/bureau.test.ts` holds this package to it.

See [docs/adr/0001-vanilla-tier.md](docs/adr/0001-vanilla-tier.md) for why.

Ambient `snow` and `rain` implement `FxAmbient<AmbientOptions>`: `spawn(viewport,
options, random)` creates a bounded field and `stepAmbient(effect, particles,
viewport, random, dt)` advances and recycles it immutably. Snow has 120 live
particles at most, rain 200; `intensity` (default 0.4) selects a share of that
budget. `wind` is horizontal px/s and `colors` overrides the weather palette.
Particles use infinite life and no twinkle; renderers stop the field explicitly.
The `line` shape is a vertical streak of length `size` and width 1.2 CSS px,
rotated by `rotation`. Native renderers can implement the same shape.

`nationalDay`, `newYear` and `winter` are effect definitions with preset defaults,
usable with the same model and renderer APIs. See the web
[effects guide](../ratio-ui/docs/fx.md) and [ADR-0003](docs/adr/0003-fx.md).
