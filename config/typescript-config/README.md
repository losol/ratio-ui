# `@ratio-ui/typescript-config`

Shared TypeScript configurations used across Ratio UI projects.

## Presets

| File                  | Use for                                                    |
| --------------------- | ---------------------------------------------------------- |
| `base.json`           | Default preset — strict, modern Node/ESM baseline.         |
| `react-library.json`  | React component libraries (JSX, DOM lib).                  |

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
