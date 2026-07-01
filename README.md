# ratio-ui

Ratio UI is a React component library and design system for knowledge sharing.
It contains reusable UI components, design tokens, Storybook documentation, and
the small build/config packages used to ship them.

## Packages

| Package                       | Path                                                   | Description                                                                         |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `@eventuras/ratio-ui`         | [`packages/ratio-ui`](packages/ratio-ui)               | Core React components, layout primitives, forms, design tokens, CSS, and Storybook. |
| `@eventuras/ratio-ui-next`    | [`packages/ratio-ui-next`](packages/ratio-ui-next)     | Next.js wrappers for Ratio UI `Image` and `Link`.                                   |
| `@ratio-ui/eslint-config`     | [`config/eslint-config`](config/eslint-config)         | Shared ESLint presets and local rules.                                              |
| `@ratio-ui/typescript-config` | [`config/typescript-config`](config/typescript-config) | Shared TypeScript config presets.                                                   |
| `@ratio-ui/vite-config`       | [`config/vite-config`](config/vite-config)             | Shared Vite library build presets.                                                  |

## Requirements

- Node.js 24 (`.nvmrc` is the source of truth)
- pnpm 11

```bash
corepack enable
nvm use
pnpm install
```

The workspace uses pnpm's `minimumReleaseAge` setting to avoid resolving very
newly published packages during installs.

## Development

```bash
pnpm storybook      # run the Ratio UI Storybook on http://localhost:6006
pnpm build          # build all packages with Turbo
pnpm lint           # lint all packages
pnpm test           # run package test suites
pnpm dev            # run package dev tasks configured for Turbo
```

For focused package work, run commands through pnpm's filter support:

```bash
pnpm --filter @eventuras/ratio-ui storybook
pnpm --filter @eventuras/ratio-ui test
pnpm --filter @eventuras/ratio-ui-next build
```

## Repository Layout

Inside `packages/ratio-ui/src`, components are grouped by intended use:

- `core`: general-purpose UI primitives such as Button, Card, Tabs, Table.
- `forms`: inputs and form helpers built around React Aria patterns.
- `layout`: layout primitives such as Container, Stack, Dialog, Drawer.
- `blocks`: larger composed sections such as Hero, Story, and error states.
- `pages`: page-level layouts and page states.
- `tokens`: CSS and TypeScript design token sources.
- `visuals`, `commerce`, `console`, `toast`: domain-oriented component groups.

## Documentation

- [`packages/ratio-ui/README.md`](packages/ratio-ui/README.md) explains how to install and consume the core package.
- [`packages/ratio-ui/docs`](packages/ratio-ui/docs) contains deeper notes on CSS exports, themes, token decisions, and component API design.
- Component behavior and examples live next to the component as Storybook stories.
- Small component-level README files are used where an API or integration needs more detail.

## Working On Components

Prefer the existing local pattern for a component group. A typical component
directory contains the component implementation, an `index.ts` export, optional
CSS, and a `*.stories.tsx` file.

Public components should be imported through package subpaths instead of a
single root barrel:

```tsx
import { Button } from '@eventuras/ratio-ui/core/Button';
import { TextField } from '@eventuras/ratio-ui/forms/Input';
```

Most application entry points also need one of the CSS entry points from
`@eventuras/ratio-ui`; see
[`packages/ratio-ui/docs/css-exports.md`](packages/ratio-ui/docs/css-exports.md).

## Changesets And Releases

Versioning and publishing are handled with
[Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset          # describe a user-facing package change
pnpm changeset:version  # update package versions and changelogs
pnpm release            # publish packages to npm
```

The PR workflow warns when a changeset is missing. Documentation-only and
internal-only changes may not need one.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the local development workflow,
component authoring expectations, and pull request checklist.

## License

Copyright (C) 2026 Losol AS

Ratio UI is free software: you can redistribute it and/or modify it under the
terms of the GNU Lesser General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

Ratio UI is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

See [`LICENSE`](LICENSE) for the LGPL-3.0 terms and
[`LICENSE.GPL-3.0.txt`](LICENSE.GPL-3.0.txt) for the GPL-3.0 terms it builds on.
