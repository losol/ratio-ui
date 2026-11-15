---
'@eventuras/ratio-ui': minor
'@eventuras/ratio-ui-core': minor
---

`Chat.Prompt` (beta): a small form in a chat message, for a question the reader answers in the log.

- A message's new optional `prompt` is data, so an agent can ask with a tool call. Two kinds: `confirm` (confirm or decline, one press, with its own button text and `tone: 'danger'`) and `choice` (pick one option, or several with `multiple`, then send). `dismissible` adds "Skip".
- A prompt has a status. `open` shows the controls, `sending` holds them while the answer is on its way, `answered` replaces them with a receipt that stays in the log, and `closed` says it no longer takes an answer, with an optional `closedNote`. A prompt with a `response` and no `status` is answered.
- `Chat.Log` renders the prompt under the message's text and reports the answer through the new `onRespond(messageId, response)`. The caller updates the message; the log keeps no state. Without `onRespond` prompts are read-only. `labels.prompt` holds the prompt's built-in text.
- `ChatPrompt` is exported for use on its own, for example above a composer. The name is also the type of the prompt's data.
- `Chat.MessageCard` shows a message's prompt read-only.
- A prompt never takes focus when it arrives. After an answer, focus waits on the prompt, where the receipt appears. A tap on a prompt's options or buttons does not open the message's bar.
- A `kind` the renderer does not know shows its title and description and no controls, so the message's `text` should still ask the question.

`@eventuras/ratio-ui-core/chat`, for every renderer to share, gains `ChatLogMessage.prompt`, the types `ChatPrompt`, `ChatConfirmPrompt`, `ChatChoicePrompt`, `ChatPromptOption`, `ChatPromptResponse` and `ChatPromptStatus`, and the rules `promptStatus(prompt)` and `describePromptResponse(prompt, response, labels)`. `ChatLog` in `@eventuras/ratio-ui-native` does not render prompts yet.
