---
'@eventuras/ratio-ui': minor
---

New `@eventuras/ratio-ui/fx` (beta): visual effects on the page. `play(effect, { origin, colors, seed, … })` draws `confetti` or `sparkles` from an element or a point on one canvas over the page (`pointer-events: none`, `aria-hidden`, removed when the effect is over), in the theme's primary, accent and status colours unless given others or a badge tier's metal. It returns `{ motion, finished, stop }`. Under `prefers-reduced-motion` nothing moves and the element gets a ring for a moment; inside `data-motion="none"` nothing happens. `useFx()` is the React hook that stops a component's effects when it unmounts. The effects and their rules come from `@eventuras/ratio-ui-core/fx` and are re-exported.
