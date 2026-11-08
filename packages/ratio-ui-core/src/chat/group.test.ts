// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { CHAT_GROUP_WINDOW_MS, continuesGroup } from './group';
import type { ChatLogMessage } from './types';

let n = 0;
const msg = (nick?: string, extra: Partial<ChatLogMessage> = {}): ChatLogMessage => ({
  id: String(n++),
  nick,
  text: 'hi',
  ...extra,
});

describe('continuesGroup', () => {
  it('groups consecutive messages from the same nick', () => {
    expect(continuesGroup(msg('ingrid'), msg('ingrid'))).toBe(true);
    expect(continuesGroup(msg('ingrid', { type: 'msg' }), msg('ingrid'))).toBe(true);
  });

  it('matches the nick as sameNick does', () => {
    expect(continuesGroup(msg('Åse'), msg('åse'))).toBe(true);
    expect(continuesGroup(msg('åse'), msg('åsen'))).toBe(false);
  });

  it('starts a group on another nick', () => {
    expect(continuesGroup(msg('ingrid'), msg('tor'))).toBe(false);
  });

  it('starts a group on the first message', () => {
    expect(continuesGroup(undefined, msg('ingrid'))).toBe(false);
  });

  it('never groups a message without a nick', () => {
    expect(continuesGroup(msg(), msg())).toBe(false);
  });

  it.each(['divider', 'event', 'action'] as const)('breaks the group at a %s', type => {
    const between = msg('ingrid', { type });
    expect(continuesGroup(msg('ingrid'), between)).toBe(false);
    expect(continuesGroup(between, msg('ingrid'))).toBe(false);
  });

  it('ignores the display time', () => {
    expect(continuesGroup(msg('ingrid', { time: '09:00' }), msg('ingrid', { time: '17:30' }))).toBe(true);
  });
});

describe('continuesGroup with timestamps', () => {
  const t0 = Date.UTC(2026, 10, 8, 9, 0);
  const at = (ms: number) => msg('ingrid', { timestamp: ms });

  it('is five minutes', () => {
    expect(CHAT_GROUP_WINDOW_MS).toBe(5 * 60 * 1000);
  });

  it('groups messages exactly five minutes apart', () => {
    expect(continuesGroup(at(t0), at(t0 + CHAT_GROUP_WINDOW_MS))).toBe(true);
  });

  it('splits a group after more than five minutes', () => {
    expect(continuesGroup(at(t0), at(t0 + CHAT_GROUP_WINDOW_MS + 1))).toBe(false);
  });

  it('still needs the same nick', () => {
    expect(continuesGroup(at(t0), msg('tor', { timestamp: t0 }))).toBe(false);
  });

  it('takes a Date or epoch milliseconds', () => {
    expect(continuesGroup(msg('ingrid', { timestamp: new Date(t0) }), at(t0 + 60_000))).toBe(true);
    expect(continuesGroup(msg('ingrid', { timestamp: new Date(t0) }), at(t0 + 6 * 60_000))).toBe(false);
  });

  it('falls back to the nick when either side has no timestamp', () => {
    const hoursLater = t0 + 3 * 60 * 60_000;
    expect(continuesGroup(at(t0), msg('ingrid'))).toBe(true);
    expect(continuesGroup(msg('ingrid'), at(hoursLater))).toBe(true);
    // An invalid date counts as none.
    expect(continuesGroup(msg('ingrid', { timestamp: new Date('not a date') }), at(hoursLater))).toBe(true);
  });

  it('measures the pause either way round, for messages out of order', () => {
    expect(continuesGroup(at(t0), at(t0 - 30_000))).toBe(true);
    expect(continuesGroup(at(t0), at(t0 - CHAT_GROUP_WINDOW_MS - 1))).toBe(false);
  });
});
