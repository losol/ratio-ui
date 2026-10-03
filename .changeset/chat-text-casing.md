---
'@eventuras/ratio-ui': patch
---

Chat: rename the internal `chatText.ts` to `chatTextSegments.ts`.

It differed from the `ChatText.tsx` component only in casing, so on a case-insensitive
filesystem `./ChatText` and `./chatText` resolved to the same module: `tsc` reported the
collision and the chat stories failed to import `ChatText` at all. Neither module is part
of the public API — nothing is exported from `@eventuras/ratio-ui/chat` under either name,
so this changes no public surface.
