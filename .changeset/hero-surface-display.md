---
'@eventuras/ratio-ui': minor
---

Three additions to `Hero`, each usable alone; together they make a front page's poster.

- `surface="primary" | "accent" | "dark"`: a full-width fill, in the words `Footer` uses. On `primary` and `accent` the text tones, borders, `--primary` and `--accent` are re-derived from the field's ink, so titles, leads and buttons stay legible. New tokens `--hero-primary-bg`, `--hero-primary-fg`, `--hero-primary-accent`, `--hero-accent-bg`, `--hero-accent-fg` let a theme reskin the fields.
- `disc`: a filled circle cropped by the top-right corner with two fine rings stepping away from it, in `--hero-disc`.
- `Hero.Title display`: the title very large and light, like `Footer.Brand display`. An `<em>` takes the accent italic; `--hero-display-size` fits a long word on one line. `Hero.Title` also takes `style`.
