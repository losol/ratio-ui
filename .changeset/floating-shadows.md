---
'@eventuras/ratio-ui': minor
---

Floating surfaces take their shadow from runtime tokens, so a theme can restyle them:

- `--popover-shadow`: Select, ListBox, Lookup, SplitButton menu, form popovers, Toast
- `--panel-shadow`: CommandPalette, PageOverlay
- `--overlay-shadow`: Dialog, Drawer
- `--chat-bar-shadow`, `--chat-popover-shadow`: the chat reaction bar and its picker

The defaults are the old shadows, so the standard theme looks the same. Bureau sets its hard offset shadow on all of them (new `--shadow-hard-lg` and `--shadow-hard-xl` steps), so dialogs, drawers, dropdowns and toasts match its buttons and cards.
