# Visual effects (beta)

```tsx
import { play, useFx, snow, rain, winter, nationalDay, newYear } from '@eventuras/ratio-ui/fx';

const flurry = play(snow, { intensity: 0.4, wind: 12, seed: 17 });
// Later, including when the route closes:
flurry.stop();
await flurry.finished;

play(rain, { intensity: 0.3, colors: ['#7696b3'] }); // keep the handle to stop it
play(nationalDay, { origin: button });
play(newYear, { origin: button, rockets: 3 });
const december = play(winter);
december.stop();
```

In a React component, `const fx = useFx()` accepts the same arguments as `play`
and stops every owned effect on unmount. Provide a visible stop control for
continuous decoration. Ambient `finished` waits for `stop()`, unmount, or motion
refusal; zero intensity and unavailable canvas settle immediately. `stop()` is
idempotent. Overlapping effects share one canvas; stopping one leaves the others
playing. The canvas and listeners are removed after the last run ends.

## Weather options

`snow` and `rain` run until stopped. They fill the current viewport rather than
an element's box. `origin` still selects the element's motion scope and reduced
motion acknowledgement; it does not clip the field.

| Option | Default | Meaning |
| --- | --- | --- |
| `intensity` | `0.4` | Share of the live budget, rounded to a particle count and clamped to 0–1. Non-finite values give no particles. |
| `wind` | snow `12`, rain `80` | Horizontal px/s, clamped to ±500; non-finite values become 0. |
| `colors` | snow off-white, rain muted blue | Explicit color list or a `tier:*` palette. Weather colors are independent of theme. |
| `seed` | random | Reproducible initial field and recycling sequence for the same frame steps and viewport. |

Snow has at most **120 live flakes**; rain at most **200 live drops** per run.
Intensity changes density, not speed. Particles leaving the bottom or sides
re-enter at the top with a seeded horizontal position. Recycling never adds to
the live count. A resize updates the canvas immediately; subsequent frames use
the new viewport. Rain uses steady thin streaks; neither field flashes,
twinkles, shakes or plays sound.

## Occasion presets

Presets are individually exported effect definitions, not a scheduler or a
second playback API. They accept the underlying effect's options; caller values
override preset defaults. Apps decide when an occasion applies and announce the
event itself in text or a live region.

| Preset | Underlying effect | Defaults |
| --- | --- | --- |
| `nationalDay` | `confetti` burst | 120 pieces, Norwegian red/white/blue for 17 May |
| `newYear` | `fireworks` burst | 4 rockets, gold tier palette |
| `winter` | `snow` ambient | intensity 0.25 (30 live flakes) |

The small set covers the occasions in issue #305 without embedding date,
locale, timezone or holiday detection. The name `nationalDay` refers to the
Norwegian 17 May palette; pass `colors` for another palette. Apps can define
additional `FxBurst` or `FxAmbient` objects. Optional `FxBurst.colors` supplies
an effect's palette ahead of the web theme; explicit `play` colors win. Bursts
without that property retain their existing theme colors.

## Motion, visibility and decoration

Only full motion draws particles. Under `prefers-reduced-motion`, playback gives
an element a brief still acknowledgement at most; `data-motion="none"` on the
origin's ancestry (or the page for viewport playback) refuses everything. Active
ambient runs stop and settle on the next visible frame if either setting changes.
A refused run never creates a canvas, flash, shake or sound. Playback's `motion`
property records the initial decision.

The shared animation loop pauses while the document is hidden, including when
started hidden. On return, its clock resets: no hidden-time particle movement or
catch-up emission. Ambient effects remain pending until stopped. The overlay is
`aria-hidden` and `pointer-events: none`, and does not announce the event.

All page flashes still pass through the model's shared cap: at most three starts
in any rolling second, dimmed below white-out. These presets introduce no page
flashes or sound; existing lightning thunder remains opt-in after a user gesture.
AchievementBadge integration is a separate item of #305.
