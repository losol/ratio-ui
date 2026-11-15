---
'@eventuras/ratio-ui-sandbox': minor
---

New package `@eventuras/ratio-ui-sandbox` (alpha): run interactive React examples in an isolated frame.

- `Sandbox` hosts the frame. It is `sandbox="allow-scripts"` only, with a Content-Security-Policy inside it: the code cannot read the page, its cookies or storage, navigate it, or call the network. The frame grows with its content and follows the page's `data-theme` and `data-color-scheme`.
- The runtime in `dist/runtime` is React and every Ratio UI export built as ES modules a browser can import directly, with the stylesheet, the fonts and a `manifest.json`.
- `resolveRuntime` turns the manifest and the URL the runtime is served from into the import map for `Sandbox`.
