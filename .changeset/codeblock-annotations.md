---
'@eventuras/ratio-ui': minor
---

**CodeBlock: inline annotations.**

`annotations` renders notes directly beneath the line they refer to — validation
output, review comments, explanations:

```tsx
<CodeBlock
  code={source}
  annotations={[
    {
      line: 8,
      severity: 'error',
      code: 'circular-ref',
      path: 'Event.prerequisite.ref',
      message: 'An event cannot be its own prerequisite.',
    },
  ]}
/>
```

Each note takes a `severity` (`error | warning | info | success`, tinted with the
matching semantic tokens so it follows light/dark), an optional machine-readable
`code` shown as a pill, and an optional `path` for where it points. `message` is
a React node rather than an HTML string, so this stays injection-safe like the
rest of `CodeBlock`.

Unlike a hover tooltip the notes stay put: long messages get room to wrap, the
whole set is scannable at a glance, and the text lives in the document — so
keyboard and screen-reader users reach it, and a screenshot captures it.

Companion packages that wrap the core `CodeBlock` (e.g.
`@eventuras/ratio-ui-shiki`) pick this up without any change of their own.
