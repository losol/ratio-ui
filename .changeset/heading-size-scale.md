---
"@eventuras/ratio-ui": minor
---

Heading gains a `size` prop (`sm` | `md` | `lg`) that decouples the visual
scale from the semantic level. Unset keeps the document prose scale from
`global.css`; set, the heading renders on a compact editorial scale — serif
at medium weight, tight tracking, margins zeroed — for composed UI such as
cards, panels, and detail-page headers where the layout owns spacing.
