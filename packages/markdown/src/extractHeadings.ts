import { slugify } from '@eventuras/ratio-ui/utils';
import type { TocHeading } from '@eventuras/ratio-ui/core/TableOfContents';

/**
 * Pull the h2/h3 headings out of raw markdown for an "on this page" table of
 * contents, producing ids with ratio-ui's `slugify` so they match the anchors
 * a heading renderer puts on the page. Fenced code blocks are skipped, so a
 * `## comment` inside one doesn't become a phantom section; up to three spaces
 * of indentation and trailing ATX `#` characters are tolerated; and link
 * syntax and inline emphasis are stripped from the visible text. Headings that
 * slugify to nothing are dropped, since they have no anchor to link to.
 *
 * Ids are deliberately *not* de-duplicated: the id here has to match the id the
 * heading renderer assigns, and the common renderer is a stateless
 * `id={slugify(text)}` that can't disambiguate repeats. De-duplicating only one
 * side would point TOC entries at anchors that don't exist. Stable ids for
 * repeated headings need a shared, stateful slugger on both sides — a follow-up
 * once heading ids are generated in the pipeline rather than per-element.
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

    // Up to 3 leading spaces still counts as a heading (4+ is indented code).
    const match = /^ {0,3}(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;

    const text = (match[2] ?? '')
      .replace(/\s+#+\s*$/, '') // trailing ATX hashes ("## Heading ##")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // link → its label
      .replace(/[`*_]/g, '')
      .trim();

    const id = slugify(text);
    if (!id) continue; // nothing slug-able → no usable anchor

    headings.push({ id, text, level: match[1]?.length === 2 ? 2 : 3 });
  }

  return headings;
}
