---
'@eventuras/ratio-ui': minor
---

`Heading` now forwards standard DOM and ARIA attributes to the rendered
element.

`id`, `style`, `role`, `aria-*`, event handlers and the other HTML heading
attributes now reach the element, so anchor targets like
`<Heading as="h2" id={slug}>` work without wrapping the heading in an
id-bearing element. Spacing props are still compiled to utility classes, and
`className`/`testId` keep their explicit meaning — spacing keys never leak onto
the DOM (they are split out with `extractSpacingProps`).
