---
'@eventuras/ratio-ui-core': minor
---

What a native renderer needs to draw a button, a text and a card:

- All four status families on `ThemeMode`: `success*`, `info*` and `warning*` join `error*`. Bureau carries the standard theme's values, as the CSS cascades them into it.
- `theme.components`: the button's radius, resting and pressed shadow and press offset, and the card's shadow per elevation tier and its hover shadow. Shadows are named (`'shadowHard'`), so each mode inks its own.
- The shared `fontSize` and `space` scales, as the two ends of the web's fluid `clamp()`. `resolveTheme()` adds them in points at the small end, and passes `components` through.

The drift test now holds Bureau to the standard theme where Bureau inherits, and the scales to `tokens/typography.css` and `tokens/spacing.css`.
