// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui-native/badges` — beta: Open Badges in the app. Needs
// `react-native-svg` (`npx expo install react-native-svg`); it is its own
// subpath so an app without badges installs nothing for them. The data
// (the credential's shape, `defineAchievement`, baking) is
// `@eventuras/ratio-ui-core/badges`, re-exported here.

export {
  AchievementBadge,
  AchievementBadgeArt,
  type AchievementBadgeArtProps,
  type AchievementBadgeLabels,
  type AchievementBadgeLayout,
  type AchievementBadgeProps,
  type BadgeArtColors,
} from './AchievementBadge';
export {
  OB_CONTEXT,
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
} from '@eventuras/ratio-ui-core/badges';
