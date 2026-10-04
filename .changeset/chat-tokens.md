---
'@eventuras/ratio-ui-core': minor
'@eventuras/ratio-ui-native': patch
---

ratio-ui-core: the chat's colours join the theme (beta) — `chatNick`, `chatNickOp`, `chatNickVoice`, `chatMentionBg`, `chatReactionMeBg` and the rest of the web's `--chat-*` colours, in both modes — with `scale.accent` and `components.chat` (`barShadow`, `popoverShadow`). Bureau's values match `tokens/chat.css` and `themes/bureau.css`, held by its drift test. `Theme` now requires these keys.

ratio-ui-native: `ChatLog` and `ChatReactions` read the chat's colours from the theme instead of borrowing the warning family, so the voice nick and the mention band match the web.
