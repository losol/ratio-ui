---
'@eventuras/ratio-ui': minor
---

Chat.Log: links to single messages, and a card for a message on its own.

- `ChatLogMessage.href`: the message's own address. The time becomes a link to it, rendered through the new `linkAs` prop (a router's Link, `'a'` by default), named by the new `labels.messageLink` ("Message from ingrid at 09:42"). Without `href` the time stays plain text.
- `highlightedId`: the row with that id gets a tinted background, an accent edge and `aria-current="true"`, and the log scrolls it to the middle of its own scroll box (instant with `prefers-reduced-motion`). If the row isn't there yet, the scroll happens when it arrives; once per id, so later messages don't pull the view back. Every row carries `data-message-id`.
- `onCopyLink`: adds a "Copy link" button (`labels.copyLink`) to the reaction bar on messages with an `href`. The caller copies, since it knows the absolute URL. A read-only log gets a bar with just that button.
- New `Chat.MessageCard` (`ChatMessageCard`, exported from `@eventuras/ratio-ui/chat`, `@beta`): one message on its own page, with author, date and room on a small line, the text with links and mentions, the link preview, read-only reactions, a "See in the room" link and a removed state.
- `Chat.ReactionBar` gains `onCopyLink` and `copyLinkLabel`.
