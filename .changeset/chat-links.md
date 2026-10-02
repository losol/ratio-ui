---
'@eventuras/ratio-ui': minor
---

Chat.Log: links and link previews.

- http(s) URLs in `msg` and `action` rows are now links that open in a new tab (`rel="noopener noreferrer ugc"`), with a screen-reader note from the new `labels.opensInNewTab`. Sentence punctuation stays outside the link, a parenthesis that opens inside the URL stays in it, a `@nick` inside a URL is not a mention, and long URLs break anywhere so they never widen the log. Other schemes and bare `www.` hosts stay plain text.
- A `@` in the middle of a word (`desk@example.org`) is no longer a mention.
- New `ChatLogMessage.preview` (`ChatLinkPreview`, exported from `@eventuras/ratio-ui/chat`): a card under the text with site name (or the URL's host), title, description and a fixed-size square thumbnail. The whole card is one link, named by the title. It spans the row when the log is narrow. The log never fetches previews; the caller passes them. Messages without `preview` look exactly as before.
