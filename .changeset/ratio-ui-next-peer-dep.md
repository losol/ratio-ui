---
"@eventuras/ratio-ui-next": minor
---

Make `@eventuras/ratio-ui` a peer dependency (was a regular dependency). Consumers now provide a single shared copy of ratio-ui, avoiding duplicate-instance issues (e.g. mismatched React context). Install `@eventuras/ratio-ui` (>=2.7.0) alongside this package.
