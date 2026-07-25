# @eventuras/markdown

Markdown rendering for [Ratio UI](https://github.com/losol/ratio-ui) — React
components built on `react-markdown` (remark/rehype), sanitised by default.

## Installation

```bash
pnpm add @eventuras/markdown @eventuras/ratio-ui
```

Install the peer dependencies it expects:

```bash
pnpm add react react-dom react-markdown remark-gfm rehype-raw rehype-sanitize
```

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

## Security Features

By default, the component:

- Strips invisible characters and control characters
- Blocks raw HTML (unless `enableRawHtml={true}`)
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
- `enableRawHtml?: boolean` - Allow raw HTML in markdown (unsafe, default: `false`)
- `allowExternalLinks?: boolean` - Allow external/absolute URLs in links and images (default: `false`)
- `codeBlock?: ComponentType<MarkdownCodeBlockProps>` - Component rendering fenced code blocks, e.g. `@eventuras/ratio-ui-shiki`'s CodeBlock for syntax highlighting (default: un-highlighted Ratio UI `CodeBlock`)
