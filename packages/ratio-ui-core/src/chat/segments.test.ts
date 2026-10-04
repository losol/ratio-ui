// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { segmentChatText } from './segments';

const links = (text: string) =>
  segmentChatText(text)
    .filter(s => s.kind === 'link')
    .map(s => s.value);

describe('segmentChatText', () => {
  it('keeps plain text as one run', () => {
    expect(segmentChatText('Two boxes behind the desk.')).toEqual([
      { kind: 'text', value: 'Two boxes behind the desk.' },
    ]);
  });

  it('splits out mentions and links in order', () => {
    expect(segmentChatText('@tor see https://example.org/plan now')).toEqual([
      { kind: 'mention', value: '@tor' },
      { kind: 'text', value: ' see ' },
      { kind: 'link', value: 'https://example.org/plan' },
      { kind: 'text', value: ' now' },
    ]);
  });

  it.each([
    ['https://example.org/talks.', 'https://example.org/talks'],
    ['(https://example.org/plan).', 'https://example.org/plan'],
    ['«https://example.org/room-2.04»!', 'https://example.org/room-2.04'],
    ['https://example.org/a?b=1, then', 'https://example.org/a?b=1'],
    ['"https://example.org/q"', 'https://example.org/q'],
  ])('leaves sentence punctuation outside: %s', (text, link) => {
    expect(links(text)).toEqual([link]);
  });

  it('keeps a closing parenthesis that opens inside the URL', () => {
    expect(links('See https://en.wikipedia.org/wiki/Mercury_(planet), then')).toEqual([
      'https://en.wikipedia.org/wiki/Mercury_(planet)',
    ]);
  });

  it.each(['www.example.org', 'javascript:alert(1)', 'mailto:desk@example.org', 'data:text/html,hi', 'https://'])(
    'does not link %s',
    text => {
      expect(links(text)).toEqual([]);
    },
  );

  it('never finds a mention inside a URL', () => {
    const segments = segmentChatText('@aisha — https://example.org/@aisha/schedule');
    expect(segments.filter(s => s.kind === 'mention')).toEqual([{ kind: 'mention', value: '@aisha' }]);
    expect(links('https://example.org/@aisha/schedule')).toEqual(['https://example.org/@aisha/schedule']);
  });

  it('does not read an address as a mention', () => {
    expect(segmentChatText('desk@example.org').some(s => s.kind === 'mention')).toBe(false);
  });

  it('reads mentions in any script, composed or decomposed', () => {
    for (const text of ['@åse hei', '@åse hei', '@Ørjan, hei', '@ingrid_2']) {
      expect(segmentChatText(text)[0]?.kind).toBe('mention');
    }
  });

  it('leaves mentions as text when told to', () => {
    expect(segmentChatText('@tor https://example.org', { mentions: false })).toEqual([
      { kind: 'text', value: '@tor ' },
      { kind: 'link', value: 'https://example.org' },
    ]);
  });
});
