---
'@eventuras/ratio-ui-core': minor
---

New `@eventuras/ratio-ui-core/fx` (beta): the model behind visual effects, with nothing that draws. Particles that carry their own physics (`FxParticle`, `stepParticles`, `particleOpacity`), seeded randomness (`fxRandom`), the `confetti` and `sparkles` bursts, their colours (`resolveFxColors`, `tierPalette` for a badge tier's metal), and the rules every renderer obeys: `fxMotion`/`fxAllowance` for `prefers-reduced-motion` and `data-motion="none"`, and `admitFlash`/`flashOpacity`, which hold any flash of the page to three a second (WCAG 2.3.1) and under white-out. See docs/adr/0003-fx.md.
