---
'@eventuras/ratio-ui': patch
---

`Grid`'s column classes are now written out instead of built from a template literal, so every `cols` value (1–6) reaches the bundle; `cols={{ lg: 2 }}` and other values no story used did nothing in an app. `cols.base` sets the columns from the narrowest screen, `gap` takes the spacing scale, and `className` is accepted. `cols` still takes any number; counts beyond 1–6 render their class as before and need the app's own Tailwind build. `grid-cols-1` … `6`, bare and under `sm:`/`md:`/`lg:`, are now among the utilities the bundled CSS guarantees; `docs/css-exports.md` lists them, the layout primitives to reach for first, and the status token names.
