# @eventuras/ratio-ui-shiki

> ⚠️ **Alpha.** Experimental and unstable — the API may change or be removed
> without notice, and it is published under the `alpha` npm dist-tag. Pin an
> exact version if you depend on it.

[Shiki](https://shiki.style) syntax highlighting for Ratio UI's
[`CodeBlock`](../ratio-ui/src/core/CodeBlock). The core `CodeBlock` stays
presentational and highlighter-agnostic; this companion package adds the Shiki
layer so you don't wire it yourself.

## Installation

```bash
pnpm add @eventuras/ratio-ui @eventuras/ratio-ui-shiki shiki
```

`@eventuras/ratio-ui` and `shiki` are peer dependencies — you control their
versions.

## Usage

A drop-in for the core `CodeBlock` that highlights `code` client-side:

```tsx
import { CodeBlock } from '@eventuras/ratio-ui-shiki';

<CodeBlock code={source} language="tsx" />;
```

It loads a highlighter asynchronously (shared per theme pair) and renders raw
code until it is ready — no flash of missing content. Token colors **follow the
app's light/dark mode** automatically (via `data-theme` / `data-color-scheme`,
like the rest of ratio-ui); pass `themes={{ light, dark }}` to change the pair.

### Static / server-rendered highlighting

For docs or RSC, highlight ahead of time and pass the result to the **core**
`CodeBlock` — then no highlighter ships to the client:

```tsx
import { CodeBlock } from '@eventuras/ratio-ui/core/CodeBlock';
import { createRatioHighlighter, shikiToDualLines, DUAL_THEME_CSS } from '@eventuras/ratio-ui-shiki';

// Render DUAL_THEME_CSS once, high in your tree, so token colors follow the
// app's light/dark mode (the client `<CodeBlock>` injects this for you):
<style dangerouslySetInnerHTML={{ __html: DUAL_THEME_CSS }} />;

const hl = await createRatioHighlighter({ langs: ['tsx'] });
<CodeBlock
  code={source}
  language="tsx"
  highlightedLines={shikiToDualLines(hl, source, 'tsx')}
/>;
```

`shikiToLines` is the single-theme equivalent if you don't need light/dark (no
`DUAL_THEME_CSS` needed — colors are inline).
Because `highlightedLines` is an array of React nodes (not an HTML string),
this path never uses `dangerouslySetInnerHTML` — it is injection-safe by
construction.

## Notes

- Uses Shiki's WASM-free JavaScript regex engine (`shiki/engine/javascript`) to
  keep the runtime light. Most common grammars are supported.
- `createRatioHighlighter` preloads a default language set (`DEFAULT_LANGS`) and
  the `github-light` / `github-dark` pair. Pass `langs` / `themes` to customize.
- The client `<CodeBlock>` injects `DUAL_THEME_CSS` itself (React style
  hoisting); include it manually only when you render dual-theme lines by hand.

## Roadmap

- A `useShikiHighlighter` hook for advanced control.
- Optional fine-grained core (`shiki/core`) build for minimal bundles.
