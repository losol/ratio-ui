---
"@eventuras/ratio-ui": patch
---

**ToggleButtonGroup: don't fire the deprecated `onChange` in multiple mode.**

The deprecated scalar `onChange(value | null)` callback can only represent a
single selection, but it was invoked in `selectionMode="multiple"` too — where
it reported just the first key in the set, misrepresenting the selection. It now
fires only in single mode; multi-select consumers should use `onSelectionChange`
(the `Set<Key>` callback).
