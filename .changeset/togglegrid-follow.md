---
"@eventuras/ratio-ui": minor
---

`ToggleGrid` follows the playhead: `followActive` scrolls the grid on when `activeColumn` leaves the visible part, a page at a time, so the step playing is always in view (smooth, unless the reader prefers reduced motion); `columnWidth` sets the least width of a column, so the steps stay a finger wide however many there are and the grid scrolls sideways below it. Row headers now stay put at the left while the steps scroll under them.
