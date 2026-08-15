---
"@eventuras/ratio-ui": minor
---

Three additions that let Timeline carry release-notes-style content, plus the
`Settings` icon in the barrel.

`Timeline.Item` gains `layout` and `marker`, and `timestamp` becomes optional.
`layout="inline"` puts the title first with timestamp and actor trailing as
muted meta — the release-notes voice, where audit logs want the default
`"stacked"` (when, then what). `marker="ring"` draws a hollow circle instead of
a filled dot, for items that mark a point in a series rather than report an
outcome. `icon` still overrides both. Existing items are unchanged.

`Card` gains `accent`, a left edge stripe in a status color for colour-coding a
stack of cards by category or severity. It touches only the left border, so it
composes with `color`, `border`, `borderColor` and `hoverEffect` — on hover the
stripe holds its color while the other three sides take the hover border.
