# Badges

Open Badges on the page: an achievement as a medallion with its words, and
a diploma that gathers several. The data is Open Badges 3.0
(`@eventuras/ratio-ui-core/badges`), re-exported here so an app needs one
import.

```tsx
import {
  AchievementBadge,
  Diploma,
  defineAchievement,
  defineCredential,
} from '@eventuras/ratio-ui/badges';
```

## The pieces

| Export | What it is |
| --- | --- |
| `AchievementBadge` | The medallion with the name, what it took, and the date it was earned. `layout` is `tile`, `row` or `art`. |
| `AchievementBadgeArt` | The medallion alone, as self-contained SVG: on a page, or as the file to bake. |
| `Diploma` | A sheet: `Eyebrow`, `Title`, `Recipient`, `Text`, `Achievements`, `Footer`, `Signature`, `Meta`. |
| `defineAchievement`, `defineCredential`, `defineProfile` | The spec's JSON with the `type` and `@context` filled in. |
| `bakeSvg`, `bakePng`, `unbakeSvg`, `unbakePng` | Put a credential inside its picture, and take it out. |

## From a page to a file

1. Draw the art with the colours resolved — a custom property means nothing
   outside the page it was set on:

   ```tsx
   import { renderToStaticMarkup } from 'react-dom/server';

   const svg = renderToStaticMarkup(
     <AchievementBadgeArt
       display={{ shape: 'rosette', tier: 'gold', symbol: '×' }}
       title={achievement.name}
       colors={{ ink: '#0b6a78', paper: '#fff', muted: '#6b7280' }}
       frame={3}
       fontFamily="Georgia, serif"
       width={480}
       height={480}
     />,
   );
   ```

2. Have the issuer's service sign the credential (a `proof`, or a JWS).
   This package never holds a key.

3. Bake it: `bakeSvg(svg, signedCredential)`. The file now carries its own
   proof, as Open Badges 3.0 describes.

## Tokens

`tokens/badge.css`: `--badge-ink`, `--badge-paper`, `--badge-muted`,
`--badge-frame` (the outline's stroke in the medallion's 100 units),
`--badge-font-family`, the metals `--badge-bronze|silver|gold`, and the
diploma's `--diploma-ink`, `--diploma-paper`, `--diploma-frame-width`,
`--diploma-font-family`, `--diploma-body-font-family`. Tabula thickens the
frames.

## What is not here

Signing and verification. An `OpenBadgeCredential` carries its `proof`; the
renderer never reads it, and `isOpenBadgeCredential` checks the shape, not
the signature. See `packages/ratio-ui-core/docs/adr/0002-open-badges.md`.
