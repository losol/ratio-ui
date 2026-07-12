---
"@eventuras/ratio-ui": patch
---

**Tree: `density` prop renamed to `size`.**

For one sizing vocabulary across the design system (matching Button, Avatar, and
ToggleButtonGroup), `Tree`'s `density` prop is now `size` on the `sm | md | lg`
scale:

- `density="comfortable"` → `size="md"` (default)
- `density="compact"` → `size="sm"` (now tighter than before)
- new `size="lg"` — roomier rows

`Tree` is pre-1.0, so this is a direct rename with no deprecation shim.
