---
"@eventuras/ratio-ui": minor
---

`ToggleButtonGroup` gains `variant="chips"`: the shared track drops away, each
option becomes its own outlined pill, and the row wraps. That is the
filter-chip form — a set with no fixed length where any number may be on at
once — as against the segmented track, which suits a few mutually exclusive
views seen together. The design sketches use both, and only the segmented one
existed. The selection API is unchanged; `variant` defaults to `'segmented'`,
so existing groups are untouched.

Underneath, the pill chrome moved into `ToggleButton` as two new variants,
`'segmented'` and `'chip'`, with the `sm | md | lg` size scale the group
already used. The group rendered React Aria's raw `ToggleButton` and styled it
inline, which left ratio-ui's own `ToggleButton` unused and diverging; now a
lone toggle and one inside a group are the same component and cannot drift
apart. Verified the segmented rendering is pixel-identical before and after.

`ToggleButton` also gains `size`. It applies to the pill variants; the older
`default` / `primary` / `outline` keep their own padding and are unchanged.
