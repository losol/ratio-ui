---
"@eventuras/ratio-ui": minor
---

The older one-off text props move to the same model as the rest: built-in
text in `labels`, a component's own name in the native `aria-label`. The old
props keep working and are marked `@deprecated` until the next major; when
both are given, `labels` wins, then the old prop, then the English default.

| Component | Old prop | Now |
|---|---|---|
| `FileDrawer` | `downloadLabel`, `closeLabel` | `labels.download`, `labels.close` |
| `Panel`, `Announcement` | `dismissLabel` | `labels.dismiss` |
| `Menu.ThemeToggle` | `lightLabel`, `darkLabel` | `labels.light`, `labels.dark` |
| `Lookup` | `emptyState`, `minCharsMessage` | `labels.empty`, `labels.minChars(n)` |
| `CommandPalette` | `emptyMessage` (with `{query}`) | `labels.empty(query)` |
| `FileUpload` | `dropzoneLabel`, `buttonLabel` | `labels.dropHint`, `labels.browse` |
| `Console.Group` | `countLabel` | `labels.count(n)` |
| `ActionButton`, `Avatar`, `ThemeToggle`, `CopyButton`, `Navbar.Toggle` | `ariaLabel` | `aria-label` |
| `CopyButton` | `withLabel` | `showLabel` |

Content you choose per use stays an ordinary prop: `placeholder`,
`ProductCard`'s `buttonText`, `AlertDialog`'s action labels, and the chat
components' texts.
