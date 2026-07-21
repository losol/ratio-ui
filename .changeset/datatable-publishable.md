---
'@eventuras/datatable': minor
---

**Publishable from this repository, and fixed for Node consumers.**

- Added `"type": "module"`. The build emits ESM, but without this Node read
  `dist/index.js` as CommonJS and threw `Cannot use import statement outside a
  module` the moment anyone imported the package.
- **Breaking:** `@eventuras/ratio-ui` moved from `dependencies` to
  `peerDependencies` (`^2.13.0`), matching the other Ratio UI companion
  packages. As a regular dependency it resolved to a pinned copy at publish
  time, so consumers ended up with a second ratio-ui beside their own —
  duplicated styles and two module instances. **Install `@eventuras/ratio-ui`
  alongside this package.**
- Ships a LICENSE (MPL-2.0), a README and a `description`; the published
  package carried none of them.
