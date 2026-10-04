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

bureau.light.primary;          // '#20304d'
bureau.light.shadowHard;       // { x: 2, y: 2, blur: 0, color: { ref: 'text', alpha: 0.62, … } }
bureau.radius.md;              // 3
bureau.font.display;           // 'Pixelify Sans'
```

A renderer without a CSS engine takes the resolved view — sRGB strings,
references followed inside their own mode, shadows in parts:

```ts
import { resolveTheme } from '@eventuras/ratio-ui-core';

const theme = resolveTheme(bureau);
theme.light.shadowHard.color;  // 'rgba(32, 36, 44, 0.62)'   — the navy ink
theme.dark.shadowHard.color;   // 'rgba(240, 231, 210, 0.62)' — the cream ink
theme.scale.primary[800];      // '#20304d' — step 800 is the light arm's navy
theme.space.m;                 // 21 — points
theme.components.button.shadow; // 'shadowHard' — read it from the mode you draw in
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
- **The schema**: `defineTheme`, `mix`, `Theme` and friends.
- **Colour maths**: `parseColor`, `oklchToRgba`, `formatColor`. Out-of-gamut
  OKLCH is clipped, not gamut-mapped as CSS does — a step at the edge of
  sRGB can land a notch off.

Until the generator lands, `ratio-ui/src/themes/bureau.css` is the web's
source and `themes/bureau.test.ts` holds this package to it.

See [docs/adr/0001-vanilla-tier.md](docs/adr/0001-vanilla-tier.md) for why.
