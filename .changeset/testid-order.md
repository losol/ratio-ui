---
"@eventuras/ratio-ui": patch
---

A `data-testid` passed to `Switch`, `NumberField`, `Menu.Link`, `Menu.Button`
or `Console` was silently dropped: the component set its own `data-testid`
after spreading caller props, and React removes an attribute set to
`undefined`. It now comes before the spread, as in most of the library, so
both routes work. `Heading`, `EmptyState` and `SaveStatus` solved this with a
conditional spread; they use the same ordering now, so there is one rule.
