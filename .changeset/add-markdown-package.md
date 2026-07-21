---
'@eventuras/markdown': minor
---

**Moved into `losol/ratio-ui`.** The package now lives beside the design system
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
