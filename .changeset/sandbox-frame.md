---
'@eventuras/ratio-ui-sandbox': minor
---

New package `@eventuras/ratio-ui-sandbox` (alpha): run interactive React examples in a frame on a separate sandbox origin.

- `Sandbox` hosts the frame, sends it the compiled code, follows its height and mirrors the page's `data-theme` and `data-color-scheme`. It refuses a frame on the page's own origin.
- The runtime in `dist/runtime` is what the sandbox origin serves: `frame.html`, and React and every Ratio UI export built as ES modules a browser can import directly, with the stylesheet, the fonts and a `manifest.json`.
- The code cannot reach the host page, its cookies or its storage, cannot navigate it or open windows, and cannot call the network.
