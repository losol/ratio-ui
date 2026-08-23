import { describe, it, expect } from 'vitest';
import { extractHeadings } from './extractHeadings';

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

describe('extractHeadings', () => {
  it('extracts h2/h3 with the injected slugify, skipping fences and h1', () => {
    const md = '# Title\n\n## First\n\n```\n## not a heading\n```\n\n### Sub *sec*';
    expect(extractHeadings(md, { slugify })).toEqual([
      { id: 'first', text: 'First', level: 2 },
      { id: 'sub-sec', text: 'Sub sec', level: 3 },
    ]);
  });

  it('drops headings that slugify to nothing', () => {
    expect(extractHeadings('## ???', { slugify })).toEqual([]);
  });
});
