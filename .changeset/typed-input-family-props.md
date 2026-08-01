---
"@eventuras/ratio-ui": minor
---

Type the Input family's props: `InputProps`/`InputFieldProps` now extend
`InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>`, so every real DOM
prop — including `onChange` — is declared and autocompletes, and handler
parameters infer under `strict` without hand annotations. Existing handlers
annotated with the narrower element types remain assignable.

The `[x: string]: any` index signature is kept for backwards compatibility but
is now `@deprecated`; it will be removed in the next major, at which point prop
typos stop compiling.

`TextField` moves from `forwardRef` to React 19 ref-as-prop (required for the
declared prop types to survive; `PropsWithoutRef` collapses named props into
the index signature). The public contract is unchanged: `ref?: Ref<HTMLElement>`
receiving the underlying `<input>`/`<textarea>`.
