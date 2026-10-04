---
'@eventuras/ratio-ui-native': minor
---

`ChatLog` (beta): the channel log for React Native. It takes the same `ChatLogMessage[]` as the web's `Chat.Log` and reads links and mentions with the shared rules in `@eventuras/ratio-ui-core/chat`.

- Each row puts the nick and time above the text, the web's narrow layout. Messages that mention `me` get the band, ops and voiced users get their glyph, and a screen reader hears the role by name.
- Links in the text and link-preview cards open through `onOpenLink`, `Linking.openURL` by default. Previews have a fixed square thumbnail, so rows don't move when images load.
- Reactions show under the message. With `onToggleReaction`, tapping one adds or takes back yours; `ChatReactions` is exported too.
- `event`, `action` and `divider` rows as on the web.
- It is a `FlatList` (other list props pass through) and does not scroll itself, the same contract as the web's log.

The chat types are re-exported from the package. The reaction picker, a highlighted message and message links are not in native yet.
