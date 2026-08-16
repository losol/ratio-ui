import { slugify } from '@eventuras/ratio-ui/utils';
import type { TocHeading } from '@eventuras/ratio-ui/core/TableOfContents';
import { extractHeadings as extractHeadingsWith } from '../core/extractHeadings';

/**
 * `core/extractHeadings` bound to ratio-ui's `slugify`, so ids match the
 * anchors a `id={slugify(text)}` heading renderer puts on the page. Pair with
 * `@eventuras/ratio-ui/core/TableOfContents`, which renders the returned
 * `TocHeading[]` and scroll-spies the matching heading ids.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  return extractHeadingsWith(markdown, { slugify });
}
