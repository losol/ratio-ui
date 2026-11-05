---
'@eventuras/ratio-ui-core': minor
---

`@eventuras/ratio-ui-core/fx` gains `fireworks` and `lightning`. A particle with a negative `age` waits to start, and one that carries a `shell` (`FxShell`) bursts into its sparks when its life ends, so fireworks need nothing from a renderer that confetti does not. `lightning` is an `FxStrike`: a jagged main channel and branches (`FxBolt`), the flashes to ask `admitFlash` for, and an optional shake of the target, read with `shakeOffset`. `FxEffect` covers both kinds.
