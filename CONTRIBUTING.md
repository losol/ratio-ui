# Contributing

Thanks for your interest in Ratio UI. This guide covers the contribution flow;
the project layout and package details are documented in [`README.md`](README.md).

## Ways To Contribute

We usually do not accept pull requests unless the change has been discussed and
agreed on in advance. This keeps the project direction clear and helps avoid
people spending time on work that may not fit the library.

There are still many useful ways to contribute:

- share ideas for components, tokens, documentation, or API improvements
- comment on existing issues and design discussions
- report bugs with clear reproduction steps, expected behavior, and screenshots
  or Storybook examples when relevant
- open an issue or discussion before starting a code change you would like to
  contribute

## Local Setup

Use the Node and pnpm versions declared by the repo. Setup and development
commands are documented in [`README.md`](README.md).

## Component Workflow

- Follow the existing pattern in the component's package and directory.
- Keep the public export in the component folder's `index.ts`.
- Add or update a Storybook story for visual states and expected usage.
- Add tests when behavior, state management, formatting, or accessibility logic
  can regress without a visual diff.
- Prefer existing tokens, CSS conventions, and package docs before adding new
  concepts.
- Keep business logic out of Ratio UI. Components should stay reusable across
  Eventuras products.

## Styling And Themes

CSS entry points and theme authoring are documented in
[`packages/ratio-ui/docs`](packages/ratio-ui/docs). When adding theme tokens,
document the intended role and update stories or docs that help reviewers see
the change.

## Changesets

Run `pnpm changeset` for changes that should publish a new package version:

- new public components or exports
- changed component behavior or styling
- package dependency or peer dependency changes
- fixes that consumers receive through npm

Documentation-only changes, Storybook-only examples, tests, and internal cleanup
usually do not need a changeset.

## Commit Messages

Use small, descriptive commits. We prefer a lightweight, readable style:

- `Docs: Add contribution guidelines`
- `Fix: Correct README package paths`
- `Feature: Add CodeBlock`
- `Chore: Update dependency workflow`

Scopes are optional. Use one when it adds clarity, such as `Docs(next): Clarify
wrapper usage`, `Chore(deps): Bump Storybook`, or `CI: Add publish workflow`.

Commit messages do not drive releases in this repository. Use Changesets to
describe package changes that should be published.

## Pull Request Checklist

- [ ] The change has been discussed and agreed on before the pull request was opened.
- [ ] The relevant Storybook stories cover the changed states.
- [ ] `pnpm lint` passes, or the package-scoped lint command passes for a narrow change.
- [ ] `pnpm test` passes when behavior is affected.
- [ ] `pnpm build` passes when exports, CSS entry points, package config, or type output changed.
- [ ] A changeset is included when the change should be released.
