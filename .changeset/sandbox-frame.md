---
'@eventuras/ratio-ui': minor
---

New `Sandbox` in `@eventuras/ratio-ui/core/Sandbox` (beta): runs a piece of compiled React code in an isolated frame, for interactive examples in content.

- The frame is `sandbox="allow-scripts"` only, with a Content-Security-Policy inside it: the code cannot read the page, its cookies or storage, navigate it, or call the network.
- What the code may import is decided by a `runtime` (an import map and stylesheets) that the app serves.
- The frame grows with its content and follows the page's `data-theme` and `data-color-scheme`.
- `buildSandboxDocument` is exported for building the frame document on its own.
