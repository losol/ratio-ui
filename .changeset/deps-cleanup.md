---
'@eventuras/datatable': patch
'@eventuras/ratio-ui': patch
---

Drop unused dependencies. `@eventuras/datatable` no longer lists `lucide-react` as a peer dependency, since its icons come through `@eventuras/ratio-ui`. `@eventuras/ratio-ui` drops the `./components/*` export, which pointed at a folder that doesn't exist.
