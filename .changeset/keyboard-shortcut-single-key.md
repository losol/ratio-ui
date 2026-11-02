---
'@eventuras/ratio-ui': patch
---

`useKeyboardShortcut` (and `SearchField`'s `shortcut`) now works for single-key shortcuts such as `'/'`. A printable non-letter key is matched on the character it produces and Shift is ignored for it, so `/` matches on Norwegian and other layouts where it is Shift+7. A combo without a modifier no longer fires, or swallows the keystroke, while the user is typing in an input, textarea, select or contenteditable element; pass `allowInEditable: true` to opt in. `isEditableTarget` is exported from `hooks`.
