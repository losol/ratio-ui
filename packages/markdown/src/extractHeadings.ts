import { slugify } from '@eventuras/ratio-ui/utils';
import type { TocHeading } from '@eventuras/ratio-ui/core/TableOfContents';

/**
 * Pull the h2/h3 headings out of raw markdown for an "on this page" table of
 * contents, producing ids with ratio-ui's `slugify` so they match the anchors
 * a heading renderer puts on the page. Fenced code blocks are skipped, so a
 * `## comment` inside one doesn't become a phantom section, and link syntax and
 * inline emphasis are stripped from the visible text.
 *
 * Pair with `@eventuras/ratio-ui/core/TableOfContents`, which renders the
 * returned `TocHeading[]` and scroll-spies the matching heading ids.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;

    const text = (match[2] ?? '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // link → its label
      .replace(/[`*_]/g, '')
      .trim();

    headings.push({ id: slugify(text), text, level: match[1]?.length === 2 ? 2 : 3 });
  }

  return headings;
}
