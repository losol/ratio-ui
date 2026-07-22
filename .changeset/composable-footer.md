---
'@eventuras/ratio-ui': minor
---

Make `Footer` composable with a set of building blocks.

New compound subcomponents let you assemble editorial or compact footers from
parts instead of hand-writing markup:

- `Footer.Brand` — logo + wordmark + a serif mission line
- `Footer.LinkColumn` + `Footer.Link` — titled link stacks; a link can carry a
  `tag` badge or an `external` arrow, and takes an `as` prop for router links
- `Footer.Publisher` — the imprint block (reuses the `Publisher` shape)
- `Footer.Newsletter` — frames a label/hint around your own signup form
- `Footer.Social` + `Footer.Social.Item` — a row of round icon links
- `Footer.BottomBar` — the thin copyright/legal row, with an optional top rule

Everything is token-driven; a `dark` footer now re-scopes the text and border
tokens so blocks stay legible on the deep surface without hardcoded colours.
`Footer` and `Footer.Classic` are unchanged, so existing footers keep working.
