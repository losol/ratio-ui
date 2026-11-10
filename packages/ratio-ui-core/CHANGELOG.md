# @eventuras/ratio-ui-core

## 0.8.0

### Minor Changes

- 90a40df: Posters (beta): a template with named places, filled with text and pictures, laid out and drawn as one SVG.
  
  - `@eventuras/ratio-ui-core/posters`: `layoutPoster` fills a `PosterTemplate` (size, colours, frame, text and picture slots) with content and sets each text at the largest size that fits its box, cut with an ellipsis and reported in `overflow` when it does not. Text is set in the theme's display and body faces (`posterTypefaces(theme.font)`, the standard theme's by default) and measured from tables of the widths of every face the themes ship, so the server and the browser break the same lines. Also `fitText`, `wrapText`, `tableMeasure` and `POSTER_SIZES`.
  - `@eventuras/ratio-ui/posters`: `Poster` draws it as SVG and renders on the server; `PosterSvg` draws a layout made first; `fonts` takes a theme's `font`; `posterToBlob` turns the SVG into a PNG, JPEG or WebP in the browser, with the theme's faces embedded (`embedPosterFonts`).
  
  Templates, content and where drafts are kept stay with the app; the stories show a generator built around it.

## 0.7.0

### Minor Changes

- e48a538: `Chat.Log`: a roomier `cards` layout, beside the one-line log.
  
  - New `layout`: `'log'` (the default, unchanged) or `'cards'`. In `cards` each message gets a square avatar with the nick's initial, the nick and time on one line, and the text below at body size, lined up with the nick. One nick's consecutive messages share the avatar and that line, as long as they are at most five minutes apart; a later message's time waits in the avatar's column and shows with the bar. Dividers become a small capital label and a rule; events and `/me` actions stay one quiet line with no avatar.
  - New `avatar`: renders the app's own avatar into the square. Return nothing for the nick's initial.
  - Everything else works in both layouts: highlighted messages, mentions of `me`, role glyphs, reactions, the bar with "Copy link", the time as a permalink through `LinkComponent`, and `activeId` / `onActivate` taps.
  - New optional `timestamp` on a message (`Date` or epoch milliseconds), never shown, read for that five-minute rule. When either of two messages has none, the nick alone decides, so a pause does not split a group; put a divider in to do that.
  - New tokens `--chat-avatar-size` (36px) and `--chat-avatar-radius` (the theme's `--radius`, so square in Tabula). The square uses the existing `--chat-avatar-bg` and `--chat-avatar-fg`.
  
  `@eventuras/ratio-ui-core/chat`, for every renderer to share, gains the optional `ChatLogMessage.timestamp`; `continuesGroup(previous, message)`, the grouping rule, and its window `CHAT_GROUP_WINDOW_MS`; and `nickInitial(nick)`, a nick's first character upper-cased.
- b2c9738: `@eventuras/ratio-ui-core/themes/tabula`: Tabula as theme data, beside Bureau. The printed sheet for a renderer without CSS: white sheets in petrol frames on a sand page, every radius 0, no shadow on cards and the soft one on buttons only (none when pressed, no press offset or growth), the 10px primary frame of a featured card, Fira Sans Condensed for display and Fira Sans for body, the petrol primary scale, and the standard theme's accent, status families and chat colours written out as the CSS cascades them. `themes/tabula.test.ts` holds the data to `ratio-ui/src/themes/tabula.css`. Pass it to `RatioProvider` in `@eventuras/ratio-ui-native` as `theme={tabula}`.

## 0.6.0

### Minor Changes

- eeeabd8: New `@eventuras/ratio-ui-core/charts` (beta): the arithmetic of a chart, shared by every renderer. `niceTicks` and `niceStep` put an axis on nice numbers and widen the domain to whole steps; `linearScale` and `bandScale` map values and categories to a fraction 0–1 of the plot; `stackSeries` stacks positives up and negatives down from zero; `valueExtent` measures what stacks and lines reach; `numberFormatter` writes ticks with the step's decimals in the reader's locale.
- 84ed491: `@eventuras/ratio-ui-core/charts`: `CHART_PALETTE` and `chartColorKey`, the series palette as the theme's colour keys (the brand, green, the accent, the ink, red, orange), so the web's `--chart-*` tokens and the native chart use the same colours in the same order.

## 0.5.0

### Minor Changes

- 42aefdd: Add bounded snow and rain ambient models, immutable recycling, and named winter, nationalDay and newYear occasion presets. Export the ambient contract and line particle shape; allow burst definitions to supply a default palette.
- 2fd0eb2: New `@eventuras/ratio-ui-core/fx` (beta): the model behind visual effects, with nothing that draws. Particles that carry their own physics (`FxParticle`, `stepParticles`, `particleOpacity`), seeded randomness (`fxRandom`), the `confetti` and `sparkles` bursts, their colours (`resolveFxColors`, `tierPalette` for a badge tier's metal), and the rules every renderer obeys: `fxMotion`/`fxAllowance` for `prefers-reduced-motion` and `data-motion="none"`, and `admitFlash`/`flashOpacity`, which hold any flash of the page to three a second (WCAG 2.3.1) and under white-out. See docs/adr/0003-fx.md.
- 134c22d: `@eventuras/ratio-ui-core/fx` gains `fireworks` and `lightning`. A particle with a negative `age` waits to start, and one that carries a `shell` (`FxShell`) bursts into its sparks when its life ends, so fireworks need nothing from a renderer that confetti does not. `lightning` is an `FxStrike`: a jagged main channel and branches (`FxBolt`), the flashes to ask `admitFlash` for, and an optional shake of the target, read with `shakeOffset`. `FxEffect` covers both kinds.

### Patch Changes

- c5675a0: Improve light-mode chat voice and self nickname contrast by using the existing accent-800 semantic alias. Keep the matching ratio-ui-core theme reference in sync. Preserve the dark-mode voice alias and global palette.
- f2e40a8: Relax the Node engine requirement to >=22 (drop the <25 upper bound).

## 0.4.0

### Minor Changes

- cef3e23: `@eventuras/ratio-ui-core/badges`: the medallion's geometry — `badgeOutline(shape, scale)` as an SVG path, `BADGE_BOX`, `BADGE_LAYOUT`, `symbolFontSize` and `captionFontSize` — so the web and native renderers draw the same badge from the same `BadgeDisplay`.

## 0.3.0

### Minor Changes

- 3b16620: New `@eventuras/ratio-ui-core/badges` (beta): Open Badges 3.0 as the badge's data. The credential's shape (`OpenBadgeCredential`, `OBAchievement`, `OBProfile`, `OBAchievementSubject`, …), `defineAchievement`, `defineProfile` and `defineCredential` to build one with the `type` and `@context` filled in, `isAchievement` and `isOpenBadgeCredential` for the shape, the medallion's look (`BadgeDisplay`, `BadgeShape`, `BadgeTier`, `BadgeState`, `BADGE_TIER_COLORS`), and baking: `bakeSvg`/`unbakeSvg` and `bakePng`/`unbakePng` put a credential (JSON or a compact JWS) inside its picture as the spec describes, and take it out. No signing or verification — a `proof` is carried, never read. See docs/adr/0002-open-badges.md.

## 0.2.0

### Minor Changes

- 622c7dc: ratio-ui-core: shadows belong to the components, in layers. A `Shadow` is one layer and takes an optional `spread`; a component's shadow is `ShadowLayers` (one or more layers) or `null`, its colours references where the CSS has them. So a theme can say what the standard theme's soft, multi-layer shadows are, not only Bureau's hard one. `ThemeMode` holds colours only: `shadowHard`, `shadowHardLg`, `shadowHardXl` and `ShadowKey` are gone, and Bureau writes its hard shadow straight into its components. `components.button` takes `pressedScale` (the standard button grows on press; Bureau's is 1). `resolveTheme()` gives `components` per mode (`components.light`, `components.dark`), each shadow inked in it. `toCssValue` writes layers, a spread and `null`.
  
  ratio-ui-native: `useTheme()` gives the component tokens of the mode in use, and `shadow(layers)` writes every layer, with its spread. `Button` scales by `pressedScale` while pressed.
- f2cde73: ratio-ui-core: `components.card.featured` (beta) — the frame of the card that should stand out: `borderWidth`, `borderColor` and `shadow`, the native counterpart of the web's `--card-featured-*` tokens. Bureau's is an 8px primary border with no shadow, held to `themes/bureau.css` by its drift test. `Theme` now requires the key.
  
  ratio-ui-native: `Card` takes `featured`, framed by the theme's `components.card.featured`, with its shadow in place of the elevation's. A featured card keeps its frame while pressed.

## 0.1.0

### Minor Changes

- 12b6f96: Bureau: teal and one grotesk. The primary is teal (`#006a7d` in light, a muted `#4fa3ae` in dark) instead of navy and blue, with a teal primary scale; the focus ring follows, and `--border-2` is the ink. Display and body are both Fira Sans (SIL OFL) instead of Pixelify Sans and Archivo; Space Mono stays for mono. `themes/bureau-fonts.css` now ships Fira Sans (400–800, italic 400/700) and Space Mono, so apps that import it get the new files with no change; the Pixelify Sans and Archivo files are gone. `@eventuras/ratio-ui-core`'s `bureau` follows (`font.display` and `font.body` are `'Fira Sans'`), so native apps load `FiraSans` instead of the two old families.
  
  `Card` takes `featured`: the card that should stand out. Its edge comes from the new `--card-featured-border-width`, `--card-featured-border-color` and `--card-featured-shadow` tokens — a 2px primary frame by default, a thick 8px poster frame without shadow in Bureau. Override the tokens per page to let a reader turn the frame down.
  
  New `BrandMark` (beta): a logo slot with a name, subtitle and tagline beside or under it — `BrandMark.Logo` (an image by `src` (its `alt` empty by default, decorative beside the name), or a logo element as children — one of them, no placeholder and no default logo; an empty `src` renders nothing), `BrandMark.Name`, `BrandMark.Subtitle`, `BrandMark.Tagline`; `layout="row|stacked"`, `size="md|lg"`. Colour is inherited, so it reads on a navbar and on a coloured band.
  
  `Footer` takes `surface`: `default` (as before), `transparent`, `primary`, `secondary`, `accent` or `dark`. A coloured footer is a local token scope — text tones and borders re-derived from the band's ink, at AA — so the blocks stay legible; tags become solid stamps. Fill and ink come from the new `--footer-*-bg` / `--footer-*-fg` tokens; in dark mode the primary and accent bands step back into the surface. `dark` still works and is deprecated in favour of `surface="dark"`.
- e71c292: The chat's data and rules move to `@eventuras/ratio-ui-core/chat` (beta), so the web and the native chat log read a message the same way:
  
  - Types: `ChatLogMessage`, `ChatReaction`, `ChatLinkPreview`, `ChatRole`.
  - Rules: `segmentChatText` (links and mentions), `sameNick` and `mentionsNick`, and `hostOf`, `previewLabel` and `hasPreviewContent` for link previews. `hostOf` reads the host with a pattern rather than `new URL()`, whose `hostname` React Native does not implement.
  - Unit-tested in core, where until now the segmenter was only covered through Storybook.
  
  `@eventuras/ratio-ui` depends on `@eventuras/ratio-ui-core` and its `Chat.*` components use these rules. Its public exports are unchanged: `ChatLogMessage`, `ChatRole`, `ChatReaction` and `ChatLinkPreview` are re-exported from `@eventuras/ratio-ui/chat`. A correction to an earlier changelog entry: the highlighted row in `Chat.Log` (`highlightedId`) has a primary-coloured edge, not an accent one.
  
  `@eventuras/ratio-ui-native` marks every component and its props `@beta`, and its LICENSE header names the package. `ratio-ui-core` marks its component tokens and scales `@beta`, and its README says the package is beta.
- 1c90770: ratio-ui-core: the chat's colours join the theme (beta) — `chatNick`, `chatNickOp`, `chatNickVoice`, `chatMentionBg`, `chatReactionMeBg` and the rest of the web's `--chat-*` colours, in both modes — with `scale.accent` and `components.chat` (`barShadow`, `popoverShadow`). Bureau's values match `tokens/chat.css` and `themes/bureau.css`, held by its drift test. `Theme` now requires these keys.
  
  ratio-ui-native: `ChatLog` and `ChatReactions` read the chat's colours from the theme instead of borrowing the warning family, so the voice nick and the mention band match the web.
- ba2dfd5: What a native renderer needs to draw a button, a text and a card:
  
  - All four status families on `ThemeMode`: `success*`, `info*` and `warning*` join `error*`. Bureau carries the standard theme's values, as the CSS cascades them into it.
  - `theme.components`: the button's radius, resting and pressed shadow and press offset, and the card's shadow per elevation tier and its hover shadow. Shadows are named (`'shadowHard'`), so each mode inks its own.
  - The shared `fontSize` and `space` scales, as the two ends of the web's fluid `clamp()`. `resolveTheme()` adds them in points at the small end, and passes `components` through.
  
  The drift test now holds Bureau to the standard theme where Bureau inherits, and the scales to `tokens/typography.css` and `tokens/spacing.css`.
- 775797c: New package: the design system as data — the vanilla tier of the family, with no React,
  no DOM and no CSS (ADR-0001).
  
  - `themes/bureau`: Bureau's semantic tokens and primary scale as authored in
    `ratio-ui/src/themes/bureau.css`, references kept as references (`mix('text', 0.62)`),
    `dark` as an overlay on `light`. A test holds the data to the CSS, value for value, until
    `ratio-ui` generates that CSS from here.
  - `resolveTheme()`: the view for a renderer without a CSS engine — sRGB hex and rgba,
    references followed inside their own mode, shadows in parts, radius in points. The colour
    maths (`parseColor`, `oklchToRgba`, `formatColor`) ships; no dependencies.
  - `defineTheme`, `mix`, `toCssValue`, `cssName`: the schema and the seed of the generator.
