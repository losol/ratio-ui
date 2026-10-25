// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui-core/badges` — beta: an Open Badges 3.0 credential's
// shape, the helpers that build one, the look of its medallion, and the
// baking that puts a credential inside its picture. No signing: a proof is
// carried, never made or checked here.

export {
  OB_CONTEXT,
  BADGE_TIER_COLORS,
  type OBAchievement,
  type OBAchievementSubject,
  type OBAchievementType,
  type OBAlignment,
  type OBCriteria,
  type OBImage,
  type OBProfile,
  type OpenBadgeCredential,
  type BadgeDisplay,
  type BadgeShape,
  type BadgeState,
  type BadgeTier,
} from './types';
export {
  achievementOf,
  defineAchievement,
  defineCredential,
  defineProfile,
  isAchievement,
  isOpenBadgeCredential,
  type AchievementInput,
  type CredentialInput,
  type ProfileInput,
} from './achievement';
export {
  BADGE_BOX,
  BADGE_LAYOUT,
  badgeOutline,
  captionFontSize,
  symbolFontSize,
} from './geometry';
export {
  OB_PNG_KEYWORD,
  OB_SVG_NAMESPACE,
  bakePng,
  bakeSvg,
  unbakePng,
  unbakeSvg,
  type BakedCredential,
  type UnbakedPng,
  type UnbakedSvg,
} from './bake';
