---
"@eventuras/ratio-ui": minor
---

`Tabs.Item`'s `title` accepts any node, not just a string — so a tab can carry
a marker beside its label: a count chip, or a dot flagging the section that
needs attention. Existing string titles are unchanged.

Two things come with it. `id` is now required when the title isn't a plain
string, since the title is otherwise what keys the tab and its panel (a node
would stringify to `[object Object]`); node titles without an `id` fall back
to their position. And `Tabs.Item` takes `aria-label`, for a title whose
meaning isn't carried by its text — the dot stays `aria-hidden` and the tab
spells it out.
