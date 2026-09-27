---
'@eventuras/ratio-ui': minor
---

New runtime tokens so a theme can restyle the last soft shadows:

- `--card-hover-shadow` / `--card-hover-shadow-tile`: the hover lift of interactive Card and Strip.
- `--navbar-shadow`: the elevated Navbar, light and dark.
- `--control-shadow` / `--control-shadow-strong`: the Switch knob and a selected ToggleButton.

The standard theme keeps the same values as before. Bureau uses its hard offset shadow for all of them, and makes `--focus-ring` solid, so focus shows as a crisp line instead of a haze.
