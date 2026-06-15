# `@ratio-ui/typescript-config`

Shared TypeScript configurations used across Ratio UI projects.

## Presets

| File                  | Use for                                                    |
| --------------------- | ---------------------------------------------------------- |
| `base.json`           | Default preset — strict, modern Node/ESM baseline.         |
| `library.json`        | Libraries that emit declarations and JS.                   |
| `react-library.json`  | React component libraries (JSX, DOM lib).                  |
| `nextjs.json`         | Next.js apps.                                              |
| `node.json`           | Node-only apps and scripts.                                |

## Usage

Install:

```sh
npm install -D @ratio-ui/typescript-config
```

Extend from your `tsconfig.json`:

```json
{
  "extends": "@ratio-ui/typescript-config/base.json",
  "include": ["src"]
}
```
