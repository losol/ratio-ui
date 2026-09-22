---
"@eventuras/ratio-ui": minor
---

`NavTree` gains a button mode, beta: with `onAction`, rows without an `href`
become buttons that report their key (`id`, else a string `title`), and
`selectedKey` marks the current one — highlighted and auto-expanded like
`currentPath`, announced with `aria-current="true"`. For navigation held in
state rather than in the URL, like the rooms of a chat. Branches without an
`href` still toggle, and links and buttons mix freely.

Items also gain `emphasized` (bold, for unseen activity such as unread
messages) and `muted` (dimmed, for something quiet on purpose).
