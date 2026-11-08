---
'@eventuras/ratio-ui': minor
'@eventuras/ratio-ui-core': minor
---

`Chat.Log`: a roomier `cards` layout, beside the one-line log.

- New `layout`: `'log'` (the default, unchanged) or `'cards'`. In `cards` each message gets a square avatar with the nick's initial, the nick and time on one line, and the text below at body size, lined up with the nick. One nick's consecutive messages share the avatar and that line, as long as they are at most five minutes apart; a later message's time waits in the avatar's column and shows with the bar. Dividers become a small capital label and a rule; events and `/me` actions stay one quiet line with no avatar.
- New `avatar`: renders the app's own avatar into the square. Return nothing for the nick's initial.
- Everything else works in both layouts: highlighted messages, mentions of `me`, role glyphs, reactions, the bar with "Copy link", the time as a permalink through `LinkComponent`, and `activeId` / `onActivate` taps.
- New optional `timestamp` on a message (`Date` or epoch milliseconds), never shown, read for that five-minute rule. When either of two messages has none, the nick alone decides, so a pause does not split a group; put a divider in to do that.
- New tokens `--chat-avatar-size` (36px) and `--chat-avatar-radius` (the theme's `--radius`, so square in Tabula). The square uses the existing `--chat-avatar-bg` and `--chat-avatar-fg`.

`@eventuras/ratio-ui-core/chat`, for every renderer to share, gains the optional `ChatLogMessage.timestamp`; `continuesGroup(previous, message)`, the grouping rule, and its window `CHAT_GROUP_WINDOW_MS`; and `nickInitial(nick)`, a nick's first character upper-cased.
