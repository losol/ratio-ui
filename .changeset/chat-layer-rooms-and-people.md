---
"@eventuras/ratio-ui": minor
---

The chat layer (`@eventuras/ratio-ui/chat`) grows its room list and its
people list, and the changelog catches up with the parts that landed before
them. Everything in `chat/` is **beta**: prop shapes may change before
release.

- `ChatChannelList` — channels, private groups and direct messages under
  eyebrow labels, mapped onto `NavTree`. Rooms are buttons (`activeId` +
  `onSelect`) or links (`href` + `currentPath`); a room with unread messages
  reads as bold, a muted one recedes, and the right slot shows one thing at
  a time: the unread count, an `@`, the bell, or the member count.
- `ChatUsers` — ops, then voiced users, then everyone else, alphabetically;
  your own row is tinted, and away people collapse to one line.
- Earlier parts, for the record: `ChatLog` (the dense channel log with
  mentions and reactions), `ChatReactions`, `ChatPresenceDot`,
  `ChatUnreadBadge`, and the `--chat-*` tokens.
- `BellOff` is re-exported from `icons`.

Every piece of screen-reader text is a prop, so no English ships inside the
components.
