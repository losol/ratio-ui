# Occasions

An *occasion* is a day the site marks without changing what it does — a
season, a pride week, a national day, a death. ratio-ui gives the chrome a few
named openings for it and nothing else: the occasion changes colour and a
motif, never layout. Mourning adds nothing — it takes away: an ink surface and
`data-motion="none"`. The values — which colours, which SVG, which
dates — belong to the app.

## The mechanism

1. **One attribute, set once.** The app puts `data-occasion="<name>"` on
   `<html>` (from admin, with a start and end date). For mourning it also sets
   `data-motion="none"`, which stops every animation and transition on the
   page (`tokens/animations.css`).
2. **Surfaces and text via CSS on stable hooks.** Chrome components carry
   `ratio-*` classes the app can target without touching component code:

   | Hook | Element |
   | --- | --- |
   | `ratio-navbar` | the `<nav>` root |
   | `ratio-navbar__brand` / `__links` / `__link` / `__actions` | the parts |
   | `ratio-navbar__motif` / `__wash` | the occasion layers |
   | `ratio-hero` | the `<section>` root (`ratio-hero--memorial` when memorial) |
   | `ratio-hero__eyebrow` / `__title` / `__lead` | the parts — the eyebrow accent and the title's `em` colour are the usual occasion targets |
   | `ratio-hero__arcs` / `__flor` / `__watermark` / `__motif` | the occasion layers |

   Because ratio-ui's utilities live in `@layer utilities`, a plain app rule
   always wins — but only while the attribute is set:

   ```css
   [data-occasion='mourning'] .ratio-navbar {
     background-color: var(--color-primary-950);
     --text: var(--color-secondary-200);
     --text-muted: oklch(0.81 0.012 85);
   }
   ```

   (Or pass `dark` / `bgColor` from the occasion config — the props do the
   same thing in React.)
3. **Rendered slots via props.** What the component has to *draw* is a prop,
   fed from the app's occasion config:

   | Slot | Component | Rule |
   | --- | --- | --- |
   | `Navbar.Motif` (+ `entry`) | Navbar | one SVG silhouette, one colour, 32px tall, hidden below 880px; `entry` slides it in once on load |
   | `wash` | Navbar | one multiply zone per colour; the app checks AA contrast of the bar text over each |
   | `Hero.Motif` | Hero | one SVG silhouette, one colour, anchored bottom-right and cropped by the edge |
   | `arcs` | Hero | concentric multiply rings off the top-right corner, one per colour |
   | `variant="memorial"` | Hero | the memorial hero — ink, grain and band; a fixed variant |
   | `Hero.Watermark` | Hero | display text as a background layer (years, a volume, a date) in the surface's ink |

A new occasion is one CSS block and one row of config — no new component.

**Mourning** needs no occasion CSS at all: it is the built-in `ink` theme
pinned dark plus the motion switch —
`<html data-theme="ink" data-color-scheme="dark" data-motion="none">` — with an
`Announcement tone="ink"` for the words, and the site's own palette back when
the period ends.

## Rules

- One motif per surface, in a fixed field. Never repeated patterns, never a
  border of small ornaments.
- Motifs are decoration: `aria-hidden`, hidden on small screens, never the
  carrier of content.
- Motion: at most one entrance (`entry`), under 800 ms, never a loop. None at
  all in mourning — `data-motion="none"`.
- The brand mark is identity, not decoration: occasions do not recolour it.
- Announcements (`Announcement`) say something; occasions only look like
  something. They can stand together but do not need each other.
