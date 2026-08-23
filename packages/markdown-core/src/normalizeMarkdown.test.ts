import { describe, it, expect } from 'vitest';
import { normalizeMarkdown } from './normalizeMarkdown';

describe('normalizeMarkdown', () => {
  it('replaces invisible characters with spaces and strips control chars', () => {
    expect(normalizeMarkdown('a b​c\x07d')).toBe('a b cd');
  });

  it('unescapes backslash-escaped markdown', () => {
    expect(normalizeMarkdown(String.raw`\*\*bold\*\*`)).toBe('**bold**');
  });

  it('keeps newlines and tabs', () => {
    expect(normalizeMarkdown('a\n\tb')).toBe('a\n\tb');
  });
});
