// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// `@eventuras/ratio-ui-core/chat` — beta: the chat's data and the rules
// every renderer must read it by.

export type { ChatLinkPreview, ChatLogMessage, ChatReaction, ChatRole } from './types';
export { segmentChatText, type ChatTextSegment } from './segments';
export { sameNick, mentionsNick, nickInitial } from './nick';
export { CHAT_GROUP_WINDOW_MS, continuesGroup } from './group';
export { hasPreviewContent, hostOf, previewLabel } from './linkPreview';
