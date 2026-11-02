---
'@eventuras/ratio-ui': minor
---

New `Header` layout (`@eventuras/ratio-ui/layout/Header`): the top of a page, a section or an article, as a `<header>` with a heading block on the leading edge and `Header.Actions` on the trailing edge, in one row that wraps the actions under the heading when the two do not fit (`--header-lead-min`, 16rem by default). The heading block is composed, not configured: a `Heading.Group` with an eyebrow, the title and a line of `Text`, or a title with a `Badge` beside it. `align` lines the actions up with the heading block's first line, middle, last line or baseline. No margins; server-safe.
