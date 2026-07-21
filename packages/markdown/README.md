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
