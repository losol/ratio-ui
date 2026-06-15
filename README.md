# ratio-ui

A React component library and design system, extracted from the
[eventuras](https://github.com/losol/eventuras) monorepo with its full git
history.

## Packages

| Package | Description |
| --- | --- |
| [`@eventuras/ratio-ui`](libs/ratio-ui) | Core component library, design tokens and Storybook. |
| [`@eventuras/ratio-ui-next`](libs/ratio-ui-next) | Next.js bindings (`Image`, `Link`) for `@eventuras/ratio-ui`. |

The repository also bundles the shared build configuration used by the
packages above as private workspace packages:

- `@eventuras/eslint-config`
- `@eventuras/typescript-config`
- `@eventuras/vite-config`

## Getting started

This is a [pnpm](https://pnpm.io) + [Turborepo](https://turbo.build) monorepo.

```bash
pnpm install
pnpm build          # build all packages
pnpm test           # run tests
pnpm storybook      # run the ratio-ui Storybook
```

## Releasing

Versioning and publishing are handled with
[Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset          # describe a change
pnpm changeset:version  # bump versions + changelogs
pnpm release            # publish to npm
```

## License

[GPL-3.0-or-later](LICENSE)
