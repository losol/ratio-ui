---
"@eventuras/ratio-ui": minor
---

**CodeBlock: pluggable `languageSelector` slot.**

`CodeBlock` gains an optional `languageSelector` prop — a `ReactNode` rendered in
the header's right-hand toolbar (alongside copy / wrap / download). The static
language badge is dropped while a selector is present. Drop in any control and
wire the selection yourself (you own the state and swap `code` — and `language`,
which also drives the download filename + MIME):

- a **`ToggleButtonGroup`** for a couple of languages (e.g. JSON / XML), or
- a **`Select`** for many (e.g. JavaScript / TypeScript / C# / Python).

It's a slot rather than a built-in picker so `CodeBlock` stays in the `core`
layer without depending on `forms` (where `Select` lives) — you compose the
control at the call site. The selector's clicks are isolated, so interacting
with it doesn't collapse the block.

Downloads now map the language label to a real file extension (e.g.
`TypeScript` → `code.ts`, not `code.typescript`).

```tsx
<CodeBlock
  code={code}
  language={label}
  languageSelector={
    <ToggleButtonGroup
      size="sm"
      aria-label="Language"
      disallowEmptySelection
      selectedKeys={selected}
      onSelectionChange={setSelected}
      options={[{ value: 'json', label: 'JSON' }, { value: 'xml', label: 'XML' }]}
    />
  }
/>
```
