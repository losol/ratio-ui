---
"@eventuras/ratio-ui": minor
---

**SearchField `shortcut` + a generic `useKeyboardShortcut` hook.**

New in `hooks/`: **`useKeyboardShortcut(combo, handler, options)`** — parses a
`'mod+k'`-style combo (`mod` = ⌘ on Apple platforms, Ctrl elsewhere), binds a
global listener, keeps the handler in a ref, SSR-safe. Ships with
`shortcutLabel(combo)` (platform-correct `⌘K` / `Ctrl+K` text for `Kbd`
hints) and `isApplePlatform()`. Reusable for command palettes, dialogs, and
anything shortcut-shaped.

`SearchField` gains **`shortcut`** as the first consumer: the combo focuses
the field from anywhere, and a `Kbd` hint with the platform-correct label
shows inside the field while it's empty and unfocused.
