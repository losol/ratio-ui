---
'@eventuras/ratio-ui': patch
---

Clear all lint warnings, fixing the real bugs behind them:

- `TextField`: `cols` now reaches the textarea and `noMargin` drops the wrapper's bottom margin. Both were accepted but ignored.
- `Image`: the native `<img>` fallback no longer remounts on every render, and is lazy-loaded by default as documented.
- `PhoneInput`, `CommandPalette`, `AlertDialog`, `ThemeToggle` and `ObfuscatedEmail` no longer set state in effects, which saves an extra render.
- `Menu.ThemeToggle` no longer writes refs during render.
- `Form`: `action` and `onSubmit` are typed as the native form's props instead of `any`.
- `AutoComplete`: `filter` takes React Aria's type instead of `any`.
- `Unauthorized`: `homeUrl` was never used and is now deprecated.
