import { describe, it, expect } from 'vitest';
import { extractHeadings } from './extractHeadings';

describe('extractHeadings', () => {
  it('pulls h2/h3 headings with slugged ids', () => {
    const md = '## Getting Started\n\nsome text\n\n### Install the CLI';
    expect(extractHeadings(md)).toEqual([
      { id: 'getting-started', text: 'Getting Started', level: 2 },
      { id: 'install-the-cli', text: 'Install the CLI', level: 3 },
    ]);
  });

  it('skips headings inside fenced code blocks', () => {
    const md = '## Real\n\n```\n## Not a heading\n```\n\n### Also real';
    expect(extractHeadings(md).map((h) => h.text)).toEqual(['Real', 'Also real']);
  });

  it('strips link syntax and inline emphasis from the visible text', () => {
    const md = '## See [the docs](/docs) and `code`';
    expect(extractHeadings(md)[0]).toEqual({
      id: 'see-the-docs-and-code',
      text: 'See the docs and code',
      level: 2,
    });
  });

  it('ignores h1 and h4+', () => {
    const md = '# Title\n\n## Section\n\n#### Too deep';
    expect(extractHeadings(md).map((h) => h.text)).toEqual(['Section']);
  });

  it('tolerates indentation and trailing ATX hashes', () => {
    const md = '   ## Indented ##\n\n##   Spaced';
    expect(extractHeadings(md)).toEqual([
      { id: 'indented', text: 'Indented', level: 2 },
      { id: 'spaced', text: 'Spaced', level: 2 },
    ]);
  });

  it('drops headings that slugify to nothing', () => {
    const md = '## !!!\n\n## Real';
    expect(extractHeadings(md).map((h) => h.text)).toEqual(['Real']);
  });
});
