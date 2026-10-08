---
'@eventuras/ratio-ui': minor
'@eventuras/ratio-ui-core': minor
---

Bureau: teal and one grotesk. The primary is teal (`#006a7d` in light, a muted `#4fa3ae` in dark) instead of navy and blue, with a teal primary scale; the focus ring follows, and `--border-2` is the ink. Display and body are both Fira Sans (SIL OFL) instead of Pixelify Sans and Archivo; Space Mono stays for mono. `themes/bureau-fonts.css` now ships Fira Sans (400–800, italic 400/700) and Space Mono, so apps that import it get the new files with no change; the Pixelify Sans and Archivo files are gone. `@eventuras/ratio-ui-core`'s `bureau` follows (`font.display` and `font.body` are `'Fira Sans'`), so native apps load `FiraSans` instead of the two old families.

Brand frame (beta): a thick border in the brand colour, opt-in with `data-brand-frame="on"` on `<html>` (or an ancestor), so it can be a reader's setting. On `<html>` it frames the page (`<body>`, in `ratio-ui.css`); `<Card brandFrame>` and `<Panel brandFrame>` get a card-width and a thinner panel-width frame. Off, they are an ordinary card and panel. Colours and widths come from the new `--brand-frame-*` tokens; in dark mode the page frame steps back into the surface.

New `BrandMark` (beta): a logo slot with a name, subtitle and tagline beside or under it — `BrandMark.Logo` (an image by `src` (its `alt` empty by default, decorative beside the name), or a logo element as children — one of them, no placeholder and no default logo; an empty `src` renders nothing), `BrandMark.Name`, `BrandMark.Subtitle`, `BrandMark.Tagline`; `layout="row|stacked"`, `size="md|lg"`. Colour is inherited, so it reads on a navbar and on a coloured band.

`Footer` takes `surface`: `default` (as before), `transparent`, `primary`, `secondary`, `accent` or `dark`. A coloured footer is a local token scope — text tones and borders re-derived from the band's ink, at AA — so the blocks stay legible; tags become solid stamps. Fill and ink come from the new `--footer-*-bg` / `--footer-*-fg` tokens; in dark mode the primary and accent bands step back into the surface. `dark` still works and is deprecated in favour of `surface="dark"`.
