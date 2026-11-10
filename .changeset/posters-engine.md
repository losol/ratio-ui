---
'@eventuras/ratio-ui-core': minor
'@eventuras/ratio-ui': minor
---

Posters (beta): a template with named places, filled with text and pictures, laid out and drawn as one SVG.

- `@eventuras/ratio-ui-core/posters`: `layoutPoster` fills a `PosterTemplate` (size, colours, frame, text and picture slots) with content and sets each text at the largest size that fits its box, cut with an ellipsis and reported in `overflow` when it does not. Text is measured from a table of Arial-compatible widths (`POSTER_SANS`), so the server and the browser break the same lines. Also `fitText`, `wrapText`, `tableMeasure` and `POSTER_SIZES`.
- `@eventuras/ratio-ui/posters`: `Poster` draws it as SVG and renders on the server; `PosterSvg` draws a layout made first; `posterToBlob` turns the SVG into a PNG, JPEG or WebP in the browser.

Templates, content and where drafts are kept stay with the app; the stories show a generator built around it.
