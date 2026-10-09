# @eventuras/ratio-ui-core

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
