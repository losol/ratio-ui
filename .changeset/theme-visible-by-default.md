---
'@eventuras/ratio-ui': minor
---

**Breaking: `global.css` no longer hides the page until `data-theme` is set.**

The light theme is fully defined on bare `:root`, so a page with no `data-theme`
is already correctly styled. The previous `html { opacity: 0 }` guard hid it
anyway until a theme attribute appeared — which meant any consumer who never set
`data-theme` got a permanently blank white page, with no error. For a design
system that is the worst possible first-run experience.

The visibility guard is now **opt-in** and forgiving:

```css
html[data-theme-loading]:not([data-theme]):not([data-color-scheme]) {
  opacity: 0;
}
```

- Import the CSS and render — the page is visible in the light theme. No
  attribute required.
- Set `data-theme` for another palette; it can be set late without the page
  ever going blank.
- Resolving the theme in JS after first paint and want no flash? Set
  `data-theme` in a blocking `<head>` script (correct first paint), or add
  `data-theme-loading` to `<html>` and set `data-theme` once resolved.

**Migration.** If you already set `data-theme` in a blocking `<head>` script,
nothing changes. If you relied on the default `opacity: 0` to mask a
JS-resolved theme applied after paint, add `data-theme-loading` to `<html>` to
keep the same hide-until-resolved behavior.
