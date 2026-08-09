---
'@eventuras/ratio-ui': patch
---

Fix `Navbar.Brand`, `Tabs.Item` and `Button.Avatar`/`Button.Label` being `undefined` in React Server Components.

`Navbar`, `Tabs` and `Button` are `'use client'` modules that attached their compound statics inside that same module. Across the RSC boundary a server component sees a client module's exports as *references*, and a property lookup on a reference yields `undefined` — so `<Navbar>` rendered fine while `<Navbar.Brand>` threw:

```
Element type is invalid: expected a string (for built-in components) or a
class/function (for composite components) but got: undefined
```

This regressed in 2.9 when the directive was added to these files, and only surfaced at request time on non-prerendered pages — it cost eventuras a 15-day production outage on staging.

The statics now live in each component's directive-free `index`, attached to a plain local function that renders the client root. Nothing changed about which modules are client components: `Navbar` detects `Navbar.Row` and `Navbar.Collapse` children by identity (`c.type === NavbarRow`), and `Button` does the same for its parts, so moving the presentational parts to server modules would have broken row layout and collapse placement silently.

The subcomponents are now also available as named exports (`NavbarBrand`, `TabItem`, `ButtonAvatar`, …) for consumers who prefer importing them directly.

Adds `pnpm check:client-statics`, run as part of `build`, which fails when a built `'use client'` module attaches compound statics to one of its exports. Verified it flags all three offenders in published 2.17.0 and passes on this build.
