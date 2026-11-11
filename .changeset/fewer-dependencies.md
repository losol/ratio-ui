---
'@eventuras/ratio-ui': patch
---

Fewer direct dependencies: `clsx` and `react-stately` are gone.

- `useAsyncList` and `useTreeData` come from `react-aria-components`, which pins the `react-stately` they belong to, so an app can no longer end up with two copies of it.
- `cn` joins class values itself, taking the same shapes as `clsx` (strings, arrays, objects, falsy values), and still lets a later Tailwind class win a conflict. Its `ClassValue` type is exported from `@eventuras/ratio-ui/utils`.
- `Error`, `Accordion` and `NumberField` merge `className` with `cn`, like every other component: a class you pass now wins a conflict with the default.
