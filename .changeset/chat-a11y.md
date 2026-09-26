---
'@eventuras/ratio-ui': patch
---

Chat (beta) accessibility fixes:

- `Chat.Log` tells screen readers when a message mentions you (`labels.mentionsYou`). Before, only the band showed it.
- `Chat.Log` hides the `@` and `+` role glyphs and names the role instead (`labels.op`, `labels.voice`).
- `Chat.Users` names the voice role for screen readers (`labels.voice`) and lists away people alphabetically.
- `Chat.ChannelList` includes the mention in a room's screen-reader text when it also has unread messages.
