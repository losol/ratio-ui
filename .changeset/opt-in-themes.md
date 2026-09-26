---
'@eventuras/ratio-ui': minor
---

The named themes `bureau` and `ink` are now opt-in stylesheets and no longer part of `ratio-ui.css`, so pages that don't use them don't download them. If you use one of them, import it after the main stylesheet:

```css
@import '@eventuras/ratio-ui/ratio-ui.css';
@import '@eventuras/ratio-ui/themes/bureau.css';
@import '@eventuras/ratio-ui/themes/ink.css';
```

The built-in `light` and `dark` themes are unchanged and still part of `ratio-ui.css`.
