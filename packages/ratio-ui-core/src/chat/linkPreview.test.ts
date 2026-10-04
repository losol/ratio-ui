// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { hasPreviewContent, hostOf, previewLabel } from './linkPreview';

describe('hostOf', () => {
  it.each([
    ['https://example.org/venue/map', 'example.org'],
    ['https://www.Example.org', 'example.org'],
    ['http://user:pw@docs.example.org:8080/a?b#c', 'docs.example.org'],
    ['https://example.org?q=1', 'example.org'],
  ])('%s → %s', (url, host) => {
    expect(hostOf(url)).toBe(host);
  });

  it('gives back what has no host', () => {
    expect(hostOf('not a url')).toBe('not a url');
  });
});

describe('link previews', () => {
  it('is worth a card with a title or a description', () => {
    expect(hasPreviewContent({ url: 'https://example.org', title: 'Map' })).toBe(true);
    expect(hasPreviewContent({ url: 'https://example.org', description: 'Rooms' })).toBe(true);
    expect(hasPreviewContent({ url: 'https://example.org' })).toBe(false);
  });

  it('labels the card with the site, or the host', () => {
    expect(previewLabel({ url: 'https://example.org/a', siteName: 'Example Venue' })).toBe('Example Venue');
    expect(previewLabel({ url: 'https://www.example.org/a' })).toBe('example.org');
  });
});
