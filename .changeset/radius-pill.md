---
'@eventuras/ratio-ui': minor
---

A new `--radius-pill` token (`rounded-pill`, default `9999px`) replaces `rounded-full` on pills, dots, badges, avatars, switches, steppers, toggle groups, the chat reaction bar and the like, so a theme can square them off. The standard theme looks the same.

Bureau now squares nearly everything: `--radius-pill` is 3px, and it also sets `--chip-radius` and `--action-button-radius`. SplitButton's outer frame follows `--button-radius`. Only spinners and decorative circles stay round.
