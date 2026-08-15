---
"@eventuras/ratio-ui": patch
---

The standard theme now declares `color-scheme` — `light` on `:root`, `dark` on
`:root[data-theme='dark'], :root[data-color-scheme='dark']`. It was the one
theme missing it; `bureau.css` and `theme-template.css` already declare it, and
the template documents it as part of the theme contract. Without it the browser
renders native chrome in light mode under the dark theme, which is why
checkboxes showed up as white boxes on dark surfaces. Scrollbars, date pickers
and other native controls follow too.

`Checkbox` swaps `text-(--primary)` for `accent-primary` — `text-*` never
reached a native checkbox, so the checked state now actually picks up the brand
color.
