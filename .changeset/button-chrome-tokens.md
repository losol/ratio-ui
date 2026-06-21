---
"@eventuras/ratio-ui": minor
---

Make Button shadow and press feedback themeable via generic tokens, alongside the existing `--button-radius`. New `--button-shadow`, `--button-shadow-active`, and `--button-transform-active` tokens (defaults preserve the standard look: no shadow, grow-on-press) let any theme reskin button chrome without touching the component. Button's press feedback now reads `--button-transform-active` instead of a hardcoded `active:scale` utility. The bureau theme uses these for a hard offset shadow (ink-coloured, reduced alpha) plus a press-down on `:active`. Button token defaults live in `tokens/button.css` (mirroring `tokens/chip.css`); the consuming rules in `core/Button/Button.css`.
