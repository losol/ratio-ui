# @eventuras/markdown

## 0.13.0

### Minor Changes

- 71c0a89: Fix dark mode. Code blocks, inline code, blockquotes and rules were rendered
  with hardcoded light Tailwind greys and turned near-invisible under
  `data-theme="dark"`. Rendering now delegates to ratio-ui's theme-aware
  components, so no hardcoded colours remain in the component map:

  - fenced code blocks → `CodeBlock`
  - inline code → `InlineCode`
  - blockquotes → `Blockquote`
  - thematic breaks → `Divider`

  Requires `@eventuras/ratio-ui` `^2.15.0` (peer range raised from `^2.13.0`) for
  the new `InlineCode` and `Divider` primitives.

- 80cbd81: Add `extractHeadings(markdown)`, which pulls the h2/h3 headings out of raw
  markdown as a `TocHeading[]` for an "on this page" table of contents. Ids are
  produced with ratio-ui's `slugify`, so they match the anchors a heading
  renderer puts on the page; fenced code blocks are skipped and link/emphasis
  syntax is stripped from the visible text. Pairs with
  `@eventuras/ratio-ui/core/TableOfContents`.
- f8207a1: Move the markdown engine into runtime dependencies, and name its component type.

  - `react-markdown`, `rehype-raw`, `rehype-sanitize` and `remark-gfm` move from
    peer to regular dependencies. They are internal implementation — the component
    builds its own render pipeline and shares no instance across the package
    boundary — so consumers no longer have to install them by hand. Only `react`,
    `react-dom` and `@eventuras/ratio-ui`, which genuinely need one shared copy,
    remain peers.
  - New exported type `MarkdownComponents` for `customComponents`. It is
    react-markdown's `Components` (plus custom element names from remark plugins),
    aliased so consumers import it from this package instead of reaching into
    react-markdown, and so the name survives a future change of renderer.

## 0.12.0

### Minor Changes

- 2f52323: **Moved into `losol/ratio-ui`.** The package now lives beside the design system
  it renders with, and is released from this repository.

  - **Relicensed from MIT to MPL-2.0**, matching the rest of the Ratio UI family.
  - **Renumbered onto a `0.x` line.** The package was never published to npm — its
    old version tracked the `eventuras` monorepo rather than this package's own
    API — so `9.0.6` became `0.11.6`, each former major bump becoming a minor one.
  - The `@eventuras/ratio-ui` peer range tightens from `>=1` to `^2.13.0`. The old
    range accepted a v1 design system against components written for v2.
  - Shared config now comes from this repository's `@ratio-ui/*` packages
    (typescript, vite and eslint config) instead of the `@eventuras/*` ones.
  - `test` runs `vitest run` rather than watch mode, and the package is registered
    as a vitest project at the repo root so its jsdom environment and setup files
    apply — without that, its tests would silently skip locally and fail in CI.
  - **Fixed: extending the sanitize schema dropped the default attributes** for
    any tag the extension also named. Both `mergeSanitizeSchemas` and
    `MarkdownContent`'s own merge used a shallow spread, so extending `a` with a
    single attribute discarded the rest of GitHub's allowlist for `a` — including
    `href`, silently breaking every link. Attribute lists are now concatenated
    per tag and de-duplicated.
  - Documentation fix: the README claimed `data:` URLs were blocked outright. They
    are blocked in links but allowed for images, per GitHub's default schema.

> **Versions before the move were renumbered.** This package was developed in
> the `eventuras` monorepo and never published to npm, so its version tracked
> that repository rather than this package's own API. On moving here it was
> renumbered onto a `0.x` line: each former major bump became a minor bump
> (the breaking slot in `0.x`), so `9.0.6` became `0.11.6`. The entries below
> keep their original text — only the version headings changed.

## 0.11.6

### Patch Changes

- 5519c0b: Consume `@eventuras/ratio-ui` (`^2.7.0`) and `@eventuras/ratio-ui-next` (`^0.2.0`) from npm instead of the workspace; both libraries now live in `losol/ratio-ui`.

## 0.11.5

### Patch Changes

- a29b507: Stop bundling runtime dependencies into published library output, and stop minifying.

  The vanilla/react/next library presets used to inline every transitive dep (e.g. `oauth4webapi` was bundled into `@eventuras/fides-auth`) and minify class/function names. Two consequences:
  - **`instanceof` failed across module boundaries.** A consumer importing `ResponseBodyError` from `openid-client` got a different class than the one a library threw, because the library carried its own bundled+renamed copy.
  - **Stack traces were unreadable** — minified names like `j` instead of `ResponseBodyError`.

  The presets now:
  - Auto-externalize every entry in the consumer's `dependencies`, `peerDependencies`, and `optionalDependencies` (plus `node:*` built-ins).
  - Set `build.minify: false` (libraries should not minify — consumers minify their own bundle).
  - Emit sourcemaps so consumer stack traces map back to original sources.

  No API changes — all affected packages are bumped `patch`. The only observable effect is leaner, more debuggable output: deps are required at install time (already the case via each lib's `dependencies`) instead of duplicated inside the bundle.

## 0.11.4

### Patch Changes

- Updated dependencies [3543c98]
  - @eventuras/ratio-ui@1.0.4

## 0.11.3

### Patch Changes

- 7c9fe79: chore: update dependencies
- Updated dependencies [7c9fe79]
  - @eventuras/ratio-ui@1.0.3

## 0.11.2

### Patch Changes

- Updated dependencies [e0b00a9]
  - @eventuras/ratio-ui@1.0.2

## 0.11.1

### Patch Changes

- Updated dependencies [e073558]
  - @eventuras/ratio-ui@1.0.1

## 0.11.0

### Patch Changes

- Updated dependencies [abaa171]
- Updated dependencies [202f819]
- Updated dependencies [7b0c54c]
  - @eventuras/ratio-ui@1.0.0

## 0.10.1

### Patch Changes

- Updated dependencies [d5634da]
  - @eventuras/ratio-ui@0.14.1

## 0.10.0

### Minor Changes

- ed973fc: ### Callout rendering
  - Add `remarkCallout` remark plugin — detects `> [!TYPE]` in blockquotes
  - Add `calloutComponents` using ratio-ui `Panel` component
  - Add `calloutSanitizeSchema` — sanitization whitelist for callout elements

## 0.9.0

### Patch Changes

- Updated dependencies [bbb9111]
- Updated dependencies [0e1796e]
  - @eventuras/ratio-ui@0.14.0

## 0.8.0

### Patch Changes

- Updated dependencies [0b4b869]
  - @eventuras/ratio-ui@0.13.0

## 0.7.0

### Minor Changes

- cc205db: ### 🧱 Features
  - feat(markdown): add schedule components (b0bb89a) [@eventuras/markdown]

### Patch Changes

- Updated dependencies [fce9a48]
- Updated dependencies [cc205db]
- Updated dependencies [21d0d6f]
  - @eventuras/ratio-ui@0.12.0

## 0.6.0

### Patch Changes

- Updated dependencies [c32e23c]
- Updated dependencies [39bd56b]
- Updated dependencies [c32e23c]
  - @eventuras/ratio-ui@0.11.0

## 0.5.1

### Patch Changes

- Updated dependencies [4a6097f]
  - @eventuras/ratio-ui@0.10.1

## 0.5.0

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.10.0

## 0.4.0

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @eventuras/ratio-ui@0.9.0

## 0.3.2

### Patch Changes

- chore: update deps
- Updated dependencies
  - @eventuras/ratio-ui@0.8.2

## 0.3.1

### Patch Changes

- chore: update dependencies across frontend packages
- Updated dependencies
  - @eventuras/ratio-ui@0.8.1

## 0.3.0

### Patch Changes

- Updated dependencies
  - @eventuras/ratio-ui@0.8.0

## 0.2.0

### Patch Changes

### 🐞 Bug Fixes

- fix(markdown): update build and exports (21a1879) [@eventuras/markdown]
- fix(markdown): remove unused turbo definition (ac4348e) [@eventuras/markdown]

### 🧹 Maintenance

- chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (b2de638) [@eventuras/markdown]

- Updated dependencies
  - @eventuras/ratio-ui@0.7.0

## 0.1.1

### Patch Changes

- - chore(convertoapi,docsite,web,markdown,scribo,sdk): upgrade deps (51e931b) [@eventuras/markdown]

## 0.1.0

### Minor Changes

- ## Initial history (pre-Changesets)
  - chore(markdown): prepare package (5ef73b0)
  - test(markdown): add tests to markdown component (82f3b9a)
  - feat(markdown): sanitizeMarkdown and strip invisible spaces (37903a6)
