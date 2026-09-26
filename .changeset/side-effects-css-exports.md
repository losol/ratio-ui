---
'@eventuras/ratio-ui': minor
---

- **Tree shaking:** `package.json` now declares `sideEffects` (only CSS files have side effects), so bundlers can drop the components you don't use. Importing one component from a barrel such as `@eventuras/ratio-ui/forms` no longer pulls in the whole barrel.
- **`components.css` works now:** `@eventuras/ratio-ui/components.css` was documented but never exported. It now ships: ratio-ui's styles without the page-level `html`, `body`, heading and paragraph styles, for apps that style their own page.
- **`global.css` export removed:** `@eventuras/ratio-ui/global.css` has pointed at a file that was never built since 1.0.0, so no import of it could have worked. Use `ratio-ui.css`, or `components.css` without the page-level styles.
