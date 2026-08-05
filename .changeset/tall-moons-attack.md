---
'@eventuras/markdown': minor
---

**Breaking:** replace `enableRawHtml` with a general `rehypePlugins` prop, and drop `rehype-raw` as a dependency.

`rehype-raw` was imported unconditionally but only used when `enableRawHtml` was true, so every consumer shipped ~50 kB gzipped — more than half the package's total dependency weight — for a feature most never turned on. It is now supplied by the consumer, the same way `remarkPlugins` already works:

```tsx
// before
<MarkdownContent markdown={md} enableRawHtml />

// after — pnpm add rehype-raw
import rehypeRaw from 'rehype-raw';
<MarkdownContent markdown={md} rehypePlugins={[rehypeRaw]} />
```

Sanitization is unchanged and unchanged*able*: `rehype-sanitize` always runs last, after any consumer plugins, so markup a plugin introduces is still filtered by the schema.

Consumers that never set `enableRawHtml` need no change and get the smaller bundle for free.
