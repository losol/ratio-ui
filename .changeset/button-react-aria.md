---
"@eventuras/ratio-ui": minor
---

**Button — rebuilt on React Aria, with compound parts for trigger pills.**

`Button` now uses React Aria's `Button` under the hood for unified
pointer/keyboard/touch press handling, focus-visible, and pending-state a11y.
The upgrade is **non-breaking**: the previous props keep working and are marked
`@deprecated` alongside their successors, so you can migrate at your own pace
(removed only at the next major):

- `onClick` → `onPress`
- `disabled` → `isDisabled`
- `ariaLabel` → `aria-label`

`variant` / `size` / `loading` / `icon` / `block` / `className` are unchanged,
and `buttonStyles` / `buttonSizes` still export as before (so `Link` and
`SplitButton` are unaffected).

New compound parts for a trigger pill (e.g. a user/account menu trigger),
composed on the token-driven Button chrome instead of a hand-copied class
string:

- **`Button.Avatar`** — a flush leading avatar that sits concentric with the
  pill's rounded edge.
- **`Button.Label`** — a truncating label that owns the flex `min-w-0` +
  `truncate` footgun (with an optional `maxWidth`), so long names ellipsize
  instead of blowing the pill out.

```tsx
<Button variant="primary" onPress={openMenu}>
  <Button.Avatar name={user.name} />
  <Button.Label maxWidth="20ch">{user.name}</Button.Label>
</Button>
```

Note: `Button` is now a Client Component (`'use client'`), as required by React
Aria — transparent for most apps, but relevant if you relied on it rendering in
a React Server Component graph.

Also fixes an `@import` ordering issue in the source `global.css`
(`@import "./tokens/index.css"` now precedes the `@plugin`/`@source`
statements) so it's spec-valid and works in strict dev CSS pipelines
(Vite dev / Storybook).
