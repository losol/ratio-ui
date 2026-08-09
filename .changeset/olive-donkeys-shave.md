---
'@eventuras/ratio-ui': patch
---

Fix `errors` on the Input family rejecting react-hook-form's `FieldErrors`.

`InputFieldProps.errors` documented itself as react-hook-form compatible but was typed `{ [key: string]: { message: string } }`, which `formState.errors` from `useForm()` is not assignable to — RHF's `FieldError.message` is optional. Passing it straight through, the way every consumer writes it, failed to compile:

```
Type 'FieldErrors<T>' is not assignable to type '{ [key: string]: { message: string } }'
  Types of property 'message' are incompatible
    Type 'string | undefined' is not assignable to type 'string'
```

The package also carried three disagreeing versions of this type — the public prop was strict while `InputError`, which actually reads the value, already tolerated `undefined` entries. All three now share one exported type:

```ts
export type FieldErrorMap = Record<string, { message?: string } | undefined>;
```

Structural rather than importing RHF, so no dependency on a form library. Pure widening — hand-built error maps that compiled before still compile, and there is no runtime change.

Added a type-level regression guard (`InputProps.types.test.ts`) that asserts the compatibility against the real RHF types, with `react-hook-form` as a devDependency. The original bug shipped because the compatibility claim lived only in a doc comment; `tsc` now checks it on every build.
