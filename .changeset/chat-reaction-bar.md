---
'@eventuras/ratio-ui': minor
---

`Chat.Log` (beta) lets you add reactions to a message. With `onToggleReaction` set, hovering a message or giving it keyboard focus shows a bar with quick reactions (`quickReactions`) and a picker with more (`moreReactions`). Picking an emoji calls `onToggleReaction(messageId, emoji)`, the same callback the reactions under a message already use. The bar is also exported as `Chat.ReactionBar` for custom rows. New chat tokens: `--chat-row-hover-bg` and `--chat-popover-bg`.
