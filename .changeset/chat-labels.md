---
"@eventuras/ratio-ui": minor
---

The chat components (beta) and `ThemeToggle` follow the `labels` model.

- `Chat.Users` takes `labels` (`online(n)`, `away(n)`, `you`, `op`) with
  English defaults, so the headings and tags now show without setup; the
  component passes the counts. `onlineLabel`, `awayLabel`, `youLabel` and
  `opLabel` are deprecated. Return `null` from `labels.online` to hide the
  heading.
- `Chat.Log` takes `labels.reactions` (`reactionsLabel` is deprecated), and
  `Chat.Reactions` defaults its `aria-label` to "Reactions", so the
  development warning about a missing name is gone.
- `Chat.ChannelList`'s `labels` get English defaults ("3 unread",
  "Mentioned", "Muted", "12 members", the presence), so badges are never read
  as bare numbers.
- `ThemeToggle` is named by what pressing it does ("Switch to dark mode" /
  "Switch to light mode", from `labels`) instead of a fixed "Toggle theme"
  plus a hidden text that the `aria-label` overrode and was never read. An
  explicit `aria-label` still wins.
