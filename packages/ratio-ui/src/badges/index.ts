// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui/badges` — beta: Open Badges on the page. The data
// (the credential's shape, `defineAchievement`, baking) is
// `@eventuras/ratio-ui-core/badges`, re-exported here so an app needs one
// import; the drawing is this module's.

export * from './AchievementBadge';
export * from './Diploma';
export {
  OB_CONTEXT,
  OB_PNG_KEYWORD,
  OB_SVG_NAMESPACE,
  BADGE_TIER_COLORS,
  achievementOf,
  bakePng,
  bakeSvg,
  defineAchievement,
  defineCredential,
  defineProfile,
  isAchievement,
  isOpenBadgeCredential,
  unbakePng,
  unbakeSvg,
} from '@eventuras/ratio-ui-core/badges';
export type {
  AchievementInput,
  BadgeDisplay,
  BadgeShape,
  BadgeState,
  BadgeTier,
  BakedCredential,
  CredentialInput,
  OBAchievement,
  OBAchievementSubject,
  OBAchievementType,
  OBAlignment,
  OBCriteria,
  OBImage,
  OBProfile,
  OpenBadgeCredential,
  ProfileInput,
  UnbakedPng,
  UnbakedSvg,
} from '@eventuras/ratio-ui-core/badges';
