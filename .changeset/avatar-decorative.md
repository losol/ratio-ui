---
'@eventuras/ratio-ui': minor
---

`Avatar` can be used from a server component: it is now a client component (`'use client'`), as its fallback to the initials when the picture fails to load already made it. Before, importing it into a React Server Component failed with "useState only works in Client Components".

`Avatar` takes `decorative`, for an avatar beside the person's visible name, as in a byline or a list of people: it is then hidden from assistive technology, so a screen reader says the name once instead of the label, the initials and the name.
