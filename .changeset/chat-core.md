---
'@eventuras/ratio-ui-core': minor
'@eventuras/ratio-ui': patch
'@eventuras/ratio-ui-native': patch
---

The chat's data and rules move to `@eventuras/ratio-ui-core/chat` (beta), so the web and the native chat log read a message the same way:

- Types: `ChatLogMessage`, `ChatReaction`, `ChatLinkPreview`, `ChatRole`.
- Rules: `segmentChatText` (links and mentions), `sameNick` and `mentionsNick`, and `hostOf`, `previewLabel` and `hasPreviewContent` for link previews. `hostOf` reads the host with a pattern rather than `new URL()`, whose `hostname` React Native does not implement.
- Unit-tested in core, where until now the segmenter was only covered through Storybook.

`@eventuras/ratio-ui` depends on `@eventuras/ratio-ui-core` and its `Chat.*` components use these rules. Its public exports are unchanged: `ChatLogMessage`, `ChatRole`, `ChatReaction` and `ChatLinkPreview` are re-exported from `@eventuras/ratio-ui/chat`. A correction to an earlier changelog entry: the highlighted row in `Chat.Log` (`highlightedId`) has a primary-coloured edge, not an accent one.

`@eventuras/ratio-ui-native` marks every component and its props `@beta`, and its LICENSE header names the package. `ratio-ui-core` marks its component tokens and scales `@beta`, and its README says the package is beta.
