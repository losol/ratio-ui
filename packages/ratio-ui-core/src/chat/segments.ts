// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

/**
 * A run of message text: plain, an `@nick` mention, or an http(s) link.
 * @beta Shape may change before release.
 */
export type ChatTextSegment = {
  kind: 'text' | 'mention' | 'link';
  value: string;
};

// Only http(s): no `javascript:`, `data:` or bare `www.` hosts. The run ends
// at whitespace or a quote, and trailing punctuation is trimmed below.
const URL = /https?:\/\/[^\s<>"'`]+/gi;

// Letters in any script, combining marks included, so `@åse` is a mention
// whether the å arrives composed or decomposed. The `@` must start a word,
// so `desk@example.org` is an address, not a mention of `@example`. The
// capture group makes `split` keep the mentions, at every odd index.
const MENTION = /(?<![\p{L}\p{M}\p{N}_])(@[\p{L}\p{M}\p{N}_-]+)/u;

// Punctuation that ends a sentence around a link rather than the link itself.
const TRAILING = new Set(['.', ',', ';', ':', '!', '?', '»', '"', "'", ')', ']', '}']);

const count = (s: string, ch: string) => s.split(ch).length - 1;

/**
 * Drops sentence punctuation from the end of a matched URL. A closing
 * parenthesis stays when its opening one is inside the URL, as in
 * `https://en.wikipedia.org/wiki/Mercury_(planet)`.
 */
const trimUrl = (raw: string): string => {
  let end = raw.length;
  while (end > 0) {
    const ch = raw[end - 1]!;
    if (!TRAILING.has(ch)) break;
    if (ch === ')' && count(raw.slice(0, end), '(') >= count(raw.slice(0, end), ')')) break;
    end -= 1;
  }
  return raw.slice(0, end);
};

/**
 * Splits message text into plain runs, mentions and links. Links are found
 * first, so a mention is never inside a URL and a URL is never a mention.
 * The one reading of a message every renderer shares, so the web and an
 * app link and highlight the same runs.
 * @beta May change before release.
 */
export function segmentChatText(text: string, { mentions = true } = {}): ChatTextSegment[] {
  const out: ChatTextSegment[] = [];
  const pushText = (value: string) => {
    if (!value) return;
    if (!mentions) {
      out.push({ kind: 'text', value });
      return;
    }
    value.split(MENTION).forEach((part, i) => {
      if (part) out.push({ kind: i % 2 === 1 ? 'mention' : 'text', value: part });
    });
  };

  let last = 0;
  for (const match of text.matchAll(URL)) {
    const url = trimUrl(match[0]);
    // Nothing after the scheme: not a link.
    if (!/^https?:\/\/./i.test(url)) continue;
    pushText(text.slice(last, match.index));
    out.push({ kind: 'link', value: url });
    last = match.index + url.length;
  }
  pushText(text.slice(last));
  return out;
}
