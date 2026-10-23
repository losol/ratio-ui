---
'@eventuras/ratio-ui-core': minor
---

New `@eventuras/ratio-ui-core/badges` (beta): Open Badges 3.0 as the badge's data. The credential's shape (`OpenBadgeCredential`, `OBAchievement`, `OBProfile`, `OBAchievementSubject`, …), `defineAchievement`, `defineProfile` and `defineCredential` to build one with the `type` and `@context` filled in, `isAchievement` and `isOpenBadgeCredential` for the shape, the medallion's look (`BadgeDisplay`, `BadgeShape`, `BadgeTier`, `BadgeState`, `BADGE_TIER_COLORS`), and baking: `bakeSvg`/`unbakeSvg` and `bakePng`/`unbakePng` put a credential (JSON or a compact JWS) inside its picture as the spec describes, and take it out. No signing or verification — a `proof` is carried, never read. See docs/adr/0002-open-badges.md.
