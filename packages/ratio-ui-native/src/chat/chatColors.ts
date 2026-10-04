// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { RatioTheme } from '../RatioProvider';

/**
 * The chat's colours, read from the theme the way the web's `--chat-*`
 * tokens are. Core carries no chat tokens or accent scale yet, so the
 * voice nick and the mention band borrow the warning family, the theme's
 * nearest to the web's accent steps. Moves to core when chat tokens do.
 */
export const chatColors = ({ colors, scale, scheme }: RatioTheme) => {
  const dark = scheme === 'dark';
  const primary = scale.primary;
  return {
    nick: colors.text,
    nickOp: dark ? primary[300] : primary[700],
    nickVoice: colors.warningText,
    mentionBg: colors.warningBg,
    mentionEdge: colors.accent,
    reactionMeBg: dark ? primary[900] : primary[100],
    reactionMeBorder: dark ? primary[700] : primary[300],
  };
};
