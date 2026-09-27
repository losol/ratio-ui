---
'@eventuras/ratio-ui': minor
---

`Menu`'s trigger and popover now take their look from `--menu-trigger-*`, `--menu-chevron-*` and `--menu-popover-*` tokens (in `tokens/menu.css`), so a theme can restyle the user menu the way `--button-*` restyles buttons.

- **Bureau:** the menu now matches bureau buttons. The trigger has square-ish corners, an ink border and the hard shadow. Open, it is pressed down into its shadow and filled with the primary. The popover gets the hard shadow instead of the glow.
- **Fix:** the open trigger's label was nearly invisible in dark mode, because the `dark:` text colour beat the open state's. It is now dark on the light fill.
