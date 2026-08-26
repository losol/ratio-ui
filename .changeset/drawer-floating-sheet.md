---
"@eventuras/ratio-ui": minor
---

Drawer is now a floating sheet: inset from the screen edges with radius,
border and shadow, a real scrim behind it (new themable `--scrim` token),
slide transitions, a draggable dismiss handle on top/bottom sheets, and new
`Drawer.Eyebrow` plus `scrim`/`stackOffset` props for stacked drawers.
The close button moved into `Drawer.Header`'s row, and slot padding moved
from the panel into the slots so the body scrolls alone and the footer
divider runs full-bleed. Breaking detail: a drawer composed without the
slots gets no default padding anymore — use the slots, or pad the content
yourself. Full anatomy is documented in the Drawer stories.

Dialog joins the same family: one shell (surface, hairline border, shared
`--radius-overlay`/`--shadow-overlay`/`--ease-overlay`/`--scrim` tokens,
slot padding with a full-bleed footer divider) where a dialog is the
centered placement — fade + scale entry — and a drawer the edge placement.
New `Dialog.Header` and `Dialog.Eyebrow` mirror Drawer's; AlertDialog and
CommandPalette inherit the look.
