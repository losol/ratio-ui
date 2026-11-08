// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { sameNick } from './nick';
import type { ChatLogMessage } from './types';

/**
 * The longest pause, in milliseconds, inside one group: five minutes.
 * @beta May change before release.
 */
export const CHAT_GROUP_WINDOW_MS = 5 * 60 * 1000;

const isMsg = (message: ChatLogMessage) => (message.type ?? 'msg') === 'msg';

/** Epoch milliseconds, or `undefined` for a missing or invalid timestamp. */
const msOf = (timestamp: ChatLogMessage['timestamp']) => {
  const ms = timestamp instanceof Date ? timestamp.getTime() : timestamp;
  return ms !== undefined && Number.isFinite(ms) ? ms : undefined;
};

/**
 * Whether `message` continues the group `previous` belongs to, so it can
 * share its avatar and name line: both are messages from the same nick,
 * at most `CHAT_GROUP_WINDOW_MS` apart. A divider, event or action between
 * them, or another nick, starts a new group.
 *
 * The pause counts only when both carry a `timestamp`; otherwise the nick
 * alone decides. It is measured either way round, so a little clock skew
 * between senders does not split a group.
 *
 * @beta May change before release.
 */
export const continuesGroup = (
  previous: ChatLogMessage | undefined,
  message: ChatLogMessage,
): boolean => {
  if (!previous || !isMsg(previous) || !isMsg(message) || !sameNick(previous.nick, message.nick)) {
    return false;
  }
  const [before, after] = [msOf(previous.timestamp), msOf(message.timestamp)];
  return before === undefined || after === undefined || Math.abs(after - before) <= CHAT_GROUP_WINDOW_MS;
};
