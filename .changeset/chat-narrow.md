---
'@eventuras/ratio-ui': patch
---

Chat.Log: a narrow log stacks each message. Below 32rem of log width (a phone, or a side panel; the log measures itself, not the viewport) the nick and time share one line and the text, reactions and link preview take the full width below. Wider logs keep the column layout. Events, actions and dividers are unchanged. The `ChatLinkPreview.image` doc now says `width` and `height` are the source image's dimensions; the card shows a fixed square thumbnail and does not read them.
