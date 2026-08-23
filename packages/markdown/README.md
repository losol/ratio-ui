# @eventuras/markdown

Markdown rendering for [Ratio UI](https://github.com/losol/ratio-ui) —
sanitised by default. This package is the Ratio UI *binding* of
[`@eventuras/markdown-react`](../markdown-react), which owns the
engine (parsing, GFM, sanitization, URL policy); this package maps each
rendered element to a ratio-ui component. See
[ADR-0001](docs/adr/0001-engine-renderer-split.md) for the split.

## Installation

```bash
pnpm add @eventuras/markdown @eventuras/ratio-ui
```

Install the peer dependencies it expects:

```bash
pnpm add react react-dom
```

The engine (`react-markdown`, `remark-gfm`, `rehype-sanitize`) comes with
`@eventuras/markdown-react`, a regular dependency — nothing extra to
install.

Raw HTML is opt-in and needs one more package — see
[Raw HTML](#raw-html-opt-in).

## Usage

```tsx
import { MarkdownContent } from '@eventuras/markdown';

// Basic usage (only relative links allowed)
<MarkdownContent markdown="Hello **world**!" />

// Allow external links and images
<MarkdownContent 
  markdown="Check out [example.com](https://example.com)" 
  allowExternalLinks={true}
/>
```

## Syntax highlighting (opt-in)

Fenced code blocks render as Ratio UI's `CodeBlock`, un-highlighted, by
default. To highlight them, pass a component as `codeBlock` — the seam is
made for `@eventuras/ratio-ui-shiki`'s CodeBlock, a drop-in that highlights
with [Shiki](https://shiki.style) and follows the app's light/dark mode:

```tsx
import { MarkdownContent } from '@eventuras/markdown';
import { CodeBlock as ShikiCodeBlock } from '@eventuras/ratio-ui-shiki/CodeBlock';

<MarkdownContent markdown={docs} codeBlock={ShikiCodeBlock} />
```

Nothing changes for consumers that don't opt in — no Shiki code is bundled
unless you import it. Unknown or missing fence languages fall back to plain
code, and inline code is unaffected either way.

The `codeBlock` component receives `{ code, language }` plus the chrome flags
the built-in rendering uses (see `MarkdownCodeBlockProps`), so any
CodeBlock-compatible component slots in and matches the default appearance.

## Raw HTML (opt-in)

Raw HTML in markdown is inert by default. Parsing it needs `rehype-raw`, which
is ~50 kB gzipped — more than half the parser's total weight — so it is not a
dependency of this package. Content that needs it installs it and passes it in:

```bash
pnpm add rehype-raw
```

```tsx
import rehypeRaw from 'rehype-raw';

<MarkdownContent markdown={legacyHtml} rehypePlugins={[rehypeRaw]} />
```

`rehypePlugins` is a general seam, not a raw-HTML flag — any rehype plugin
works. Plugins run *before* sanitization, which always runs last and cannot be
replaced, so markup a plugin introduces is still filtered by the schema. If a
plugin needs tags or attributes the default schema drops, widen it with
`sanitizeSchemaExtension`.

## Security Features

By default, the component:

- Strips invisible characters and control characters
- Blocks raw HTML (unless you opt in — see [Raw HTML](#raw-html-opt-in))
- **Blocks external URLs** in links and images (only relative URLs like `/events` are allowed)
- Blocks `javascript:` URLs
- Blocks `data:` URLs in links, but allows them for images — matching GitHub's
  default schema, since small inline images are a legitimate use case

### Allowing External Links

To allow external URLs (e.g., `https://example.com`), set `allowExternalLinks={true}`:

```tsx
<MarkdownContent 
  markdown="[Google](https://google.com)" 
  allowExternalLinks={true}
/>
```

Without this prop, external links will be rendered as plain text.

## Props

- `markdown?: string | null` - The markdown content to render
- `heading?: string` - Optional heading to display above the content
- `keepInvisibleCharacters?: boolean` - Keep invisible/control characters (default: `false`)
- `allowExternalLinks?: boolean` - Allow external/absolute URLs in links and images (default: `false`)
- `remarkPlugins?: any[]` - Additional remark plugins, run after `remark-gfm`
- `rehypePlugins?: any[]` - Additional rehype plugins, run before sanitization; pass `rehype-raw` here to allow raw HTML
- `sanitizeSchemaExtension?: SanitizeSchemaExtension` - Extra tags/attributes to allow through sanitization
- `codeBlock?: ComponentType<MarkdownCodeBlockProps>` - Component rendering fenced code blocks, e.g. `@eventuras/ratio-ui-shiki`'s CodeBlock for syntax highlighting (default: un-highlighted Ratio UI `CodeBlock`)
