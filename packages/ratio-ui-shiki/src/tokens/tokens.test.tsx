// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { HighlighterCore } from 'shiki/core';
import { createRatioHighlighter, codeToDualTokens, shikiToDualLines } from '../index';
import { tokensToLines, SHIKI_TOKEN_CLASS, type DualTokenLine } from './index';

const CODE = 'const answer: number = 42;\nexport default answer;';

let highlighter: HighlighterCore;

beforeAll(async () => {
  // One small grammar keeps the suite fast; themes are the defaults.
  highlighter = await createRatioHighlighter({
    langs: [import('@shikijs/langs/ts')],
  });
});

describe('codeToDualTokens', () => {
  it('produces one token line per code line, with both theme colors', () => {
    const lines = codeToDualTokens(highlighter, CODE, 'ts');
    expect(lines).toHaveLength(2);
    const styled = lines.flat().filter((t) => t.htmlStyle);
    expect(styled.length).toBeGreaterThan(0);
    for (const token of styled) {
      expect(token.htmlStyle).toHaveProperty('--shiki-light');
      expect(token.htmlStyle).toHaveProperty('--shiki-dark');
    }
  });

  it('survives a JSON round-trip unchanged', () => {
    // The whole point of the precomputed pipeline: tokens are built in a
    // build script, serialized, and shipped to the client as data.
    const lines = codeToDualTokens(highlighter, CODE, 'ts');
    const roundTripped = JSON.parse(JSON.stringify(lines)) as DualTokenLine[];
    expect(roundTripped).toEqual(lines);
  });
});

describe('tokensToLines', () => {
  it('renders spans with the token class and both custom properties', () => {
    const lines = codeToDualTokens(highlighter, CODE, 'ts');
    const html = renderToStaticMarkup(<pre>{tokensToLines(lines)}</pre>);
    expect(html).toContain(`class="${SHIKI_TOKEN_CLASS}"`);
    expect(html).toContain('--shiki-light:');
    expect(html).toContain('--shiki-dark:');
    expect(html).toContain('answer');
  });

  it('renders round-tripped tokens identically to shikiToDualLines', () => {
    // Guards the split: build-time tokens + the tiny client renderer must
    // stay pixel-identical to the direct (client-highlighting) path.
    const direct = renderToStaticMarkup(<>{shikiToDualLines(highlighter, CODE, 'ts')}</>);
    const tokens = JSON.parse(
      JSON.stringify(codeToDualTokens(highlighter, CODE, 'ts')),
    ) as DualTokenLine[];
    const precomputed = renderToStaticMarkup(<>{tokensToLines(tokens)}</>);
    expect(precomputed).toBe(direct);
  });

  it('renders plain tokens without a style attribute', () => {
    const html = renderToStaticMarkup(<>{tokensToLines([[{ content: 'plain' }]])}</>);
    expect(html).toContain('plain');
    expect(html).not.toContain('style=');
  });
});
