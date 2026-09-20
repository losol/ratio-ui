---
"@eventuras/ratio-ui": minor
---

`Panel` becomes composable. Form is split from surface: `accent` (`none`,
`pill`, `flush`, `top`, `ring`, `tint`) decides how the status meets the edge,
`surface` (`filled`, `card`, `outline`, `transparent`) decides what sits
behind the content, and `size` moves padding and the title step. The root sets
`--panel-solid/-bg/-border/-text` once per status and every treatment reads
those four, so a status is one entry rather than a row per variant — which also
retires `callout`'s dead `bg-transparent` and finally gives `neutral` a
definition instead of raw palette classes with no dark mode.

New parts: `Panel.Header` (with `icon` and `actions`), `Title`, `Description`,
`Body` (`divided`, `scrollable`, `maxHeight`), `Footer` (`align`) and `Meta`,
which renders a `DescriptionList variant="meta"` at the panel's padding.
`collapsible` is a native `<details>`, so it works before hydration and
find-in-page reaches closed content, and `open` with `onToggle` controls it;
`loading` swaps the body for a skeleton; `href` makes the root a link. The
panel stays server-safe.

`role` is no longer tied to the shape. It derives from `status` — `error`
announces as `alert`, `info`/`success`/`warning` as `status`, `neutral` not at
all — and `role={null}` opts a status panel out of the live region, which is
what server-rendered content wants. A link or collapsible panel keeps its
native role instead. `dismissible` renders the close button but never hides
the panel; the caller unmounts it, the same contract `Announcement` keeps, and
it uses `ActionButton` so the target is 44px on small screens rather than the
28px a hand-rolled button had.

`variant` is kept as a deprecated preset over `accent` + `surface` and bare
children are still wrapped in `Panel.Body`, so v1 call sites keep working. Two
visual changes to expect: `status` now defaults to `neutral` instead of `info`,
and `variant="callout"` is a true outline rather than a filled box — that one
reaches the markdown callouts.
