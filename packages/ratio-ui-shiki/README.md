# @eventuras/ratio-ui-shiki

> ⚠️ **Alpha.** Experimental and unstable — the API may change or be removed
> without notice, and it is published under the `alpha` npm dist-tag. Pin an
> exact version if you depend on it.

[Shiki](https://shiki.style) syntax highlighting for Ratio UI's
[`CodeBlock`](../ratio-ui/src/core/CodeBlock). The core `CodeBlock` stays
presentational and highlighter-agnostic; this companion package adds the Shiki
layer so you don't wire it yourself.

Built on `shiki/core` (fine-grained) with the WASM-free JavaScript regex engine,
so consumers bundle only the curated grammars — not Shiki's full registry.

## Installation

```bash
pnpm add @eventuras/ratio-ui @eventuras/ratio-ui-shiki shiki @shikijs/langs @shikijs/themes
```

`@eventuras/ratio-ui`, `shiki`, and Shiki's `@shikijs/langs` / `@shikijs/themes`
are peer dependencies — you control their versions. The `@shikijs/*` packages
ship with, and version-match, `shiki`.

## Usage

A drop-in for the core `CodeBlock` that highlights `code` client-side:

```tsx
import { CodeBlock } from '@eventuras/ratio-ui-shiki/CodeBlock';

<CodeBlock code={source} language="tsx" />;
```

It loads a shared highlighter asynchronously and renders raw code until it is
ready — no flash of missing content. Token colors **follow the app's light/dark
mode** automatically (via `data-theme` / `data-color-scheme`, like the rest of
ratio-ui).

### Static / server-rendered highlighting

For docs or RSC, highlight ahead of time and pass the result to the **core**
`CodeBlock` — then no highlighter ships to the client:

```tsx
import { CodeBlock } from '@eventuras/ratio-ui/core/CodeBlock';
import { createRatioHighlighter, shikiToDualLines, DUAL_THEME_CSS } from '@eventuras/ratio-ui-shiki';

// Render DUAL_THEME_CSS once, high in your tree, so token colors follow the
// app's light/dark mode (the client `<CodeBlock>` injects this for you):
<style dangerouslySetInnerHTML={{ __html: DUAL_THEME_CSS }} />;

const hl = await createRatioHighlighter();
<CodeBlock
  code={source}
  language="tsx"
  highlightedLines={shikiToDualLines(hl, source, 'tsx')}
/>;
```

`shikiToLines` is the single-theme equivalent if you don't need light/dark (no
`DUAL_THEME_CSS` needed — colors are inline). Because `highlightedLines` is an
array of React nodes (not an HTML string), this path never uses
`dangerouslySetInnerHTML` — it is injection-safe by construction.

### Advanced: `useShikiHighlighter`

The hook the `<CodeBlock>` wrapper is built on. It loads (and shares) the
default highlighter for your own compositions — `null` while loading, then the
ready highlighter:

```tsx
import { useMemo } from 'react';
import { CodeBlock } from '@eventuras/ratio-ui/core/CodeBlock';
import { shikiToDualLines } from '@eventuras/ratio-ui-shiki';
import { useShikiHighlighter } from '@eventuras/ratio-ui-shiki/useShikiHighlighter';

function Code({ source }: { source: string }) {
  const hl = useShikiHighlighter();
  const lines = useMemo(
    () => (hl ? shikiToDualLines(hl, source, 'tsx') : undefined),
    [hl, source],
  );
  return <CodeBlock code={source} language="tsx" highlightedLines={lines} />;
}
```

Need other languages or themes? Create a highlighter with your own imports and
pass it in (`langs` / `themes` **replace** the defaults, so include everything
you need):

```tsx
const hl = await createRatioHighlighter({
  langs: [import('@shikijs/langs/rust'), import('@shikijs/langs/tsx')],
});
// useShikiHighlighter(hl)  — or  <CodeBlock highlighter={hl} … />
```

## Notes

- `createRatioHighlighter` preloads a curated language set (`DEFAULT_LANGS`: tsx,
  ts, jsx, js, json, bash, css, html, markdown, yaml, xml, python, csharp) and
  the `github-light` / `github-dark` pair. Pass `langs` / `themes` as Shiki
  inputs (e.g. `import('@shikijs/langs/go')`) to change the set.
- The client `<CodeBlock>` injects `DUAL_THEME_CSS` itself (React style
  hoisting); include it manually only when you render dual-theme lines by hand.
- Entrypoints are split for RSC: the root (`.`) is server-safe (highlighter
  helpers + `DUAL_THEME_CSS` + types); the client component and hook live at
  `@eventuras/ratio-ui-shiki/CodeBlock` and `.../useShikiHighlighter`.
