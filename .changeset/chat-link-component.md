---
'@eventuras/ratio-ui': minor
---

Chat: `Chat.Log` and `Chat.MessageCard` take `LinkComponent`, the name every other
linking component uses.

- New `LinkComponent` on both, typed as `NavTreeProps['LinkComponent']` — the same prop
  `Chat.ChannelList`, `NavTree`, `Navbar` and `Breadcrumbs` already take. `Chat.Log`
  renders the time link on messages with an `href` through it; `Chat.MessageCard` renders
  the `roomHref` link.
- `linkAs` is deprecated on both and still honoured, so nothing breaks. `LinkComponent`
  wins when both are passed. Removed in 3.0.
