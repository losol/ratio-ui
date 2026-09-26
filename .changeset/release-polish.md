---
"@eventuras/ratio-ui": patch
---

- `Link` with a `button-*` variant and `block` fills the row as a flex item,
  like `Button block`. It used to switch to plain `display: block`, which
  dropped the icon and label alignment.
- `InputError` defaults to the theme's `text-error-text` instead of a fixed
  `text-red-500`, and `Unauthorized` uses `bg-error` / `text-error-on`
  instead of `bg-red-500` / `text-white`.
