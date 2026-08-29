---
"@eventuras/ratio-ui": minor
---

New built-in `ink` theme — quiet, near-black, elegant: the palette a site
wears when it wants to be still (a memorial page, an evening programme, a
literary brand). Semantic tokens only, in two arms on the named-theme axes:
`data-theme="ink"` is paper — a greyer, quieter Linen with the ink as brand —
and `data-color-scheme="dark"` is the ink itself, warm near-black with paper as
brand, so buttons and links go quiet without any component knowing. One
restrained ochre accent; status colours stay semantic. The primary *scale* is a
warm-grey ramp too, so chrome that reaches for a step directly (navbar pills,
steppers, toggles) goes quiet as well. For a site that is
always ink, pin `data-color-scheme="dark"` rather than syncing it to the OS —
the `dark:` utilities key on the attribute, so a theme cannot be dark on its
own (explained in `docs/authoring-themes.md`). Mourning becomes a recipe with
no occasion CSS: `ink` pinned dark plus `data-motion="none"`. Storybook's mode
switch gains 🖋️ Ink and 📄 Ink paper.
