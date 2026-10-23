# ADR-0002: Open Badges 3.0 as the badge's data

## Status

Accepted 2026-10-23.

## Context

Civitas wants to mark learning goals a pupil has reached — "Gangemester",
"Leser" — as badges on a profile, in a list of what there is to earn, and
later on a printed diploma. A badge generator was the first idea: a form
that picks a shape and a colour and writes a picture.

A picture alone is a dead end. The same badge has to show on the web, in the
native app and on paper; it has to say what it took and who awarded it; and
sooner or later someone will want to take it elsewhere and have it believed.
That last part is a solved problem: Open Badges 3.0 (1EdTech) is a W3C
Verifiable Credential whose subject holds an `Achievement` — name,
description, criteria, image, issuer — with a signature a third party can
check, and a way of baking the credential into the badge's own SVG or PNG.
Its fields are the fields a badge needs anyway.

## Decision

The badge's data is Open Badges 3.0, in `@eventuras/ratio-ui-core/badges`:

- **The spec's shapes, as a subset.** `OBAchievement`, `OBProfile`,
  `OBAchievementSubject`, `OpenBadgeCredential` and friends carry the fields
  a renderer or an issuer reads, with an index signature so a field the spec
  allows and we have not named survives a round trip. `defineAchievement`,
  `defineProfile` and `defineCredential` fill in the `type` and `@context`
  the spec requires. `isOpenBadgeCredential` checks the shape, not the
  signature.
- **The look beside the data, not inside it.** Open Badges says what a badge
  is and gives it an `image`; nothing in the spec says what the image looks
  like. `BadgeDisplay` (shape, tier, symbol, caption) is ours, kept beside
  the achievement so the achievement stays plain spec JSON and every
  renderer draws the same medallion from the same values. The renderer
  produces the image; the issuer stores it and points `image.id` at it.
- **Baking here, signing elsewhere.** `bakeSvg` and `bakePng` put a
  credential (JSON, or a compact JWS) inside the picture as the spec
  describes; `unbakeSvg` and `unbakePng` take it out. They are bytes and
  strings, with no dependency. Making or checking a `proof` needs keys and a
  verifier, and belongs in the issuer's service, never in a UI package: a
  `proof` is carried and never read.
- **One import path, in both tiers.** `@eventuras/ratio-ui-core/badges` for
  the data and baking; `@eventuras/ratio-ui/badges` for `AchievementBadge`,
  `AchievementBadgeArt` and `Diploma`, which re-exports the former. Not in
  the root export: the module is a domain, like `chat` and `commerce`, and
  can be lifted into its own package if it grows (PNG rendering, JSON-LD
  validation).

## Consequences

- An app renders a credential it was handed, from any issuer that follows
  the spec, with no mapping.
- Civitas can issue real, verifiable badges later without redesigning the
  data: sign the credential, bake it into the art the renderer already
  draws, host the issuer profile.
- The subset is a subset. A field we have not typed is still allowed, but
  not checked; a credential with an unknown `proof` type is carried as is.
  Validation against the JSON-LD context is a later concern, and a
  candidate for a separate package.
- The medallion is drawn from `BadgeDisplay`, which is not part of the
  credential. Two renderers that disagree on `BadgeDisplay` draw different
  badges for the same credential; the tier colours are therefore constants
  (`BADGE_TIER_COLORS`), not theme values.
