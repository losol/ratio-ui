// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { mentionsNick, sameNick } from './nick';
import { segmentChatText } from './segments';

describe('sameNick', () => {
  it('ignores case and Unicode form', () => {
    expect(sameNick('Åse', 'åse')).toBe(true);
    expect(sameNick('åse', 'åse')).toBe(true);
  });

  it('never matches a missing or empty nick', () => {
    expect(sameNick(undefined, 'tor')).toBe(false);
    expect(sameNick('', '')).toBe(false);
  });

  it('matches the whole nick only', () => {
    expect(sameNick('åsen', 'åse')).toBe(false);
  });
});

describe('mentionsNick', () => {
  it('finds a mention of the nick, not of a longer one', () => {
    expect(mentionsNick(segmentChatText('@Åse, composed'), 'åse')).toBe(true);
    expect(mentionsNick(segmentChatText('@åsen is someone else'), 'åse')).toBe(false);
    expect(mentionsNick(segmentChatText('åse without the @'), 'åse')).toBe(false);
  });

  it('ignores a nick inside a link', () => {
    expect(mentionsNick(segmentChatText('https://example.org/@tor'), 'tor')).toBe(false);
  });
});
