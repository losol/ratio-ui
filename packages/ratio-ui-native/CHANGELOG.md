# @eventuras/ratio-ui-native

## 0.1.0

### Minor Changes

- 787af43: `ChatLog` (beta): the channel log for React Native. It takes the same `ChatLogMessage[]` as the web's `Chat.Log` and reads links and mentions with the shared rules in `@eventuras/ratio-ui-core/chat`.
  
  - Each row puts the nick and time above the text, the web's narrow layout. Messages that mention `me` get the band, ops and voiced users get their glyph, and a screen reader hears the role by name.
  - Links in the text and link-preview cards open through `onOpenLink`, `Linking.openURL` by default. Previews have a fixed square thumbnail, so rows don't move when images load.
  - Reactions show under the message. With `onToggleReaction`, tapping one adds or takes back yours; `ChatReactions` is exported too.
  - `event`, `action` and `divider` rows as on the web.
  - It is a `FlatList` (other list props pass through) and does not scroll itself, the same contract as the web's log.
  
  The chat types are re-exported from the package. The reaction picker, a highlighted message and message links are not in native yet.
- c8cf845: New package: Ratio UI for React Native and Expo (SDK 57, React Native 0.86). The first components draw from `@eventuras/ratio-ui-core`'s theme data:
  
  - `RatioProvider` and `useTheme()`: Bureau by default, in the device's light or dark mode unless `colorScheme` says otherwise. A component works without a provider too.
  - `Text` (size, tone, weight, font role) and `Heading` (display font, announced with its level).
  - `Button` in five variants (primary, secondary, outline, text, danger) and three sizes, with the theme's radius, resting shadow and press. Bureau moves a pressed button into its hard shadow.
  - `Card` with the theme's border, corner and shadow per elevation tier. With `onPress` it becomes one pressable target that lifts while pressed.
  
  The hard shadow is a `boxShadow` style. An eslint rule and a build guard keep the package off `react-dom`, `react-native-web` and the web packages.

### Patch Changes

- e71c292: The chat's data and rules move to `@eventuras/ratio-ui-core/chat` (beta), so the web and the native chat log read a message the same way:
  
  - Types: `ChatLogMessage`, `ChatReaction`, `ChatLinkPreview`, `ChatRole`.
  - Rules: `segmentChatText` (links and mentions), `sameNick` and `mentionsNick`, and `hostOf`, `previewLabel` and `hasPreviewContent` for link previews. `hostOf` reads the host with a pattern rather than `new URL()`, whose `hostname` React Native does not implement.
  - Unit-tested in core, where until now the segmenter was only covered through Storybook.
  
  `@eventuras/ratio-ui` depends on `@eventuras/ratio-ui-core` and its `Chat.*` components use these rules. Its public exports are unchanged: `ChatLogMessage`, `ChatRole`, `ChatReaction` and `ChatLinkPreview` are re-exported from `@eventuras/ratio-ui/chat`. A correction to an earlier changelog entry: the highlighted row in `Chat.Log` (`highlightedId`) has a primary-coloured edge, not an accent one.
  
  `@eventuras/ratio-ui-native` marks every component and its props `@beta`, and its LICENSE header names the package. `ratio-ui-core` marks its component tokens and scales `@beta`, and its README says the package is beta.
- 1c90770: ratio-ui-core: the chat's colours join the theme (beta) — `chatNick`, `chatNickOp`, `chatNickVoice`, `chatMentionBg`, `chatReactionMeBg` and the rest of the web's `--chat-*` colours, in both modes — with `scale.accent` and `components.chat` (`barShadow`, `popoverShadow`). Bureau's values match `tokens/chat.css` and `themes/bureau.css`, held by its drift test. `Theme` now requires these keys.
  
  ratio-ui-native: `ChatLog` and `ChatReactions` read the chat's colours from the theme instead of borrowing the warning family, so the voice nick and the mention band match the web.
- Updated dependencies [12b6f96]
- Updated dependencies [e71c292]
- Updated dependencies [1c90770]
- Updated dependencies [ba2dfd5]
- Updated dependencies [775797c]
  - @eventuras/ratio-ui-core@0.1.0
