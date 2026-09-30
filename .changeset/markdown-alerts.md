---
'@eventuras/markdown': minor
'@eventuras/ratio-ui': minor
---

GitHub alerts work out of the box. `MarkdownContent` now renders `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]` and `> [!CAUTION]` as a `Panel` with the type's icon and title, in the GitHub style: a coloured stripe on the left and a coloured title. Before this they needed three props (`remarkPlugins`, `sanitizeSchemaExtension`, `customComponents`) and otherwise showed as a quote starting with a literal `[!NOTE]`.

- New `callouts` prop (default `true`). `callouts={false}` keeps alerts as plain blockquotes.
- New `labels.callouts` translates the five titles, which fall back to English.
- Lucide icons (Info, Lightbulb, MessageSquareWarning, AlertTriangle, OctagonAlert) replace the emoji. `IMPORTANT` takes the primary colour, so it no longer looks like `NOTE`.
- The panels are no longer live regions. A `CAUTION` in static content used to be announced as `role="alert"`.
- `createCalloutComponents(labels)` is exported for custom setups. `calloutComponents` still works, and passing the three props yourself is harmless.
- `@eventuras/ratio-ui` exports the `Lightbulb`, `MessageSquareWarning` and `OctagonAlert` icons. The `@eventuras/markdown` peer range moves to `^2.28.0` for them.
