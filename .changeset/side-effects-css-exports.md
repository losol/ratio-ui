---
'@eventuras/ratio-ui': minor
---

- **Tree shaking:** `package.json` now declares `sideEffects` (only CSS files have side effects), so bundlers can drop the components you don't use. Importing one component from a barrel such as `@eventuras/ratio-ui/forms` no longer pulls in the whole barrel.
- **`components.css` works now:** `@eventuras/ratio-ui/components.css` was documented but never exported. It now ships: ratio-ui's styles without the page-level `html`, `body`, heading and paragraph styles, for apps that style their own page.
- **`global.css` works now:** `@eventuras/ratio-ui/global.css` pointed at a file that was never built. It now resolves to `ratio-ui.css`, which is the same stylesheet.
