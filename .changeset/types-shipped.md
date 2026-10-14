---
"@eventuras/ratio-ui": patch
---

The package ships its type declarations again. 2.34.0 went out without a single `.d.ts`: `@eventuras/vite-config` 0.4.0 stopped emitting them from the Vite build, and the type check that ran before it wrote its output where Vite then emptied the folder. `@eventuras/vite-config` 0.5.0 emits them from `vite build` again, stories and tests left out, so the build moves to it; the type check up front is `--noEmit` now.
