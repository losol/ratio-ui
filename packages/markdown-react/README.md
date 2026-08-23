# @eventuras/markdown-react

React markdown engine, built on `react-markdown` (remark/rehype) and sanitised
by default. The engine owns everything that is hard to get right — GFM, the
sanitize-last pipeline, external-URL policy, and code-fence extraction — and
renders every visible element through a **renderer contract**, so binding it
to a design system is a small prop-to-component mapping.

The `@eventuras/markdown*` family:

- [`@eventuras/markdown-core`](../markdown-core) — vanilla-TS utilities and
  remark plugins (no React); re-exported here.
- **`@eventuras/markdown-react`** — this package: the engine + the
  `MarkdownRenderers` contract.
- [`@eventuras/markdown`](../markdown) — the Ratio UI binding most apps want.

## Installation

```bash
pnpm add @eventuras/markdown-react react react-dom
```

## Usage

Give `MarkdownEngine` a `MarkdownRenderers` set — plain components, one per
element kind. Slots never see AST nodes: the engine has already applied URL
policy and pulled `{ code, language }` out of fenced blocks when a slot is
called.

```tsx
import { MarkdownEngine, type MarkdownRenderers } from '@eventuras/markdown-react';

const renderers: MarkdownRenderers = {
  heading: ({ level, children, ...rest }) => {
    const Tag = `h${level}` as const;
    return <Tag {...rest}>{children}</Tag>;
  },
  paragraph: ({ children, ...rest }) => <p {...rest}>{children}</p>,
  link: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a>,
  list: ({ ordered, children, ...rest }) =>
    ordered ? <ol {...rest}>{children}</ol> : <ul {...rest}>{children}</ul>,
  listItem: (props) => <li {...props} />,
  blockquote: ({ cite, children }) => <blockquote cite={cite}>{children}</blockquote>,
  inlineCode: ({ children }) => <code>{children}</code>,
  codeBlock: ({ code, language }) => <pre data-language={language}>{code}</pre>,
  divider: () => <hr />,
  // Optional: image, strong, em — plain-HTML defaults otherwise.
};

<MarkdownEngine renderers={renderers} markdown="Hello **world**!" />
```

Spread the rest props onto the element you render — they carry sanitized HTML
attributes (footnote ids, `aria-*`/`data-*` from GFM) that anchors and
assistive tech depend on.

## The contract

- **Policy lives in the engine.** External links and images are blocked
  before a slot is called (opt in with `allowExternalLinks`); `javascript:`
  and friends are stripped by `rehype-sanitize`, which always runs last and
  cannot be replaced.
- **`codeBlock` gets `MarkdownCodeBlockProps`** — `{ code, language }` plus
  chrome flags — so any CodeBlock-shaped component is a drop-in (e.g.
  `@eventuras/ratio-ui-shiki`'s, for syntax highlighting).
- **`customComponents` is the escape hatch** for custom elements emitted by
  remark plugins (callouts, schedules). It is react-markdown's `Components`
  shape and thus coupled to the underlying renderer; the slot contract is the
  stable API.

## Raw HTML (opt-in)

Raw HTML is inert by default. `rehype-raw` (~50 kB gzipped) is deliberately
not a dependency — install it yourself and pass it via `rehypePlugins`;
sanitization still runs after it.
