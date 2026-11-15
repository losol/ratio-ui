# Chat.Prompt API Design

**Status:** Draft for discussion. Nothing is implemented.
**Date:** 2026-11-15

A prompt is a small form inside a chat message: confirm or decline, pick one
of a few options, fill in a couple of fields. Agents use them to ask the
reader a question the reader can answer with one press. This note proposes
the data in `@eventuras/ratio-ui-core/chat`, a `Chat.Prompt` component on the
web, and how `Chat.Log` carries it.

## Principles

1. **Data, not JSX.** A prompt is a plain object on the message, like
   `preview`. An agent can produce it from a tool call, and the web and native
   renderers read the same shape.
2. **A prompt has a life.** A chat log is history. An answered prompt becomes
   a receipt and stays in the log as one; it is never a live form twice.
3. **The caller owns the state.** `Chat.Log` reports the answer through
   `onRespond` and the caller updates the message, as with `onToggleReaction`
   and `onActivate`.
4. **Small on purpose.** Three kinds, a handful of fields, no validation
   engine and no JSON Schema. Anything larger opens a `Dialog` or `Drawer`.
5. **Readable without the prompt.** The message's `text` still asks the
   question, so notifications, older clients and unknown kinds lose the
   buttons but not the meaning.

## Data: `@eventuras/ratio-ui-core/chat`

### The prompt

```ts
/** Where a prompt is in its life. @beta */
export type ChatPromptStatus = 'open' | 'sending' | 'answered' | 'closed';

interface ChatPromptBase {
  /** A heading over the controls. The message's `text` should still ask the question. */
  title?: string;
  description?: string;
  /** @default 'open' */
  status?: ChatPromptStatus;
  /** The answer given. Shown as the receipt once `status` is `answered`. */
  response?: ChatPromptResponse;
  /** Nick the prompt is addressed to; everyone else sees it read-only. Absent: anyone may answer. */
  to?: string;
  /** Nick that answered, named in the receipt. */
  answeredBy?: string;
  /** Adds a "Skip" button, which reports `{ kind: 'dismissed' }`. */
  dismissible?: boolean;
  /** Why a `closed` prompt closed, e.g. `'Expired'`. Shown as given. */
  closedNote?: string;
}

/** Confirm or decline: OK/Cancel, Yes/No, Approve/Reject. @beta */
export interface ChatConfirmPrompt extends ChatPromptBase {
  kind: 'confirm';
  /** @default labels.confirm */
  confirmLabel?: string;
  /** @default labels.decline */
  declineLabel?: string;
  /** `danger` when confirming cannot be undone. @default 'default' */
  tone?: 'default' | 'danger';
}

/** @beta */
export interface ChatPromptOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Pick one option, or several with `multiple`. @beta */
export interface ChatChoicePrompt extends ChatPromptBase {
  kind: 'choice';
  options: ChatPromptOption[];
  /** Several may be picked; adds a submit button. @default false */
  multiple?: boolean;
  /** @default labels.submit */
  submitLabel?: string;
}

/** A couple of fields and a submit button. @beta */
export interface ChatFieldsPrompt extends ChatPromptBase {
  kind: 'fields';
  fields: ChatPromptField[];
  /** @default labels.submit */
  submitLabel?: string;
  /** Messages for fields the caller rejected, by field name. */
  errors?: Record<string, string>;
}

/** @beta */
export type ChatPrompt = ChatConfirmPrompt | ChatChoicePrompt | ChatFieldsPrompt;
```

### Fields

```ts
interface ChatPromptFieldBase {
  /** Key of the value in the response. */
  name: string;
  label: string;
  description?: string;
  required?: boolean;
}

/** @beta */
export type ChatPromptField =
  | (ChatPromptFieldBase & {
      kind: 'text';
      defaultValue?: string;
      placeholder?: string;
      multiline?: boolean;
      /** Picks the keyboard and the browser's own check. */
      format?: 'email' | 'url' | 'tel';
    })
  | (ChatPromptFieldBase & {
      kind: 'number';
      defaultValue?: number;
      min?: number;
      max?: number;
      step?: number;
    })
  | (ChatPromptFieldBase & { kind: 'toggle'; defaultValue?: boolean })
  | (ChatPromptFieldBase & { kind: 'select'; options: ChatPromptOption[]; defaultValue?: string });
```

Four field kinds: text, number, toggle and select. They are the primitives a
flat form needs, and they are what MCP's elicitation request allows (string,
number, boolean, enum), so an elicitation maps onto a `fields` prompt
without a translation layer.

### The response

```ts
/** @beta */
export type ChatPromptResponse =
  | { kind: 'confirm'; accepted: boolean }
  | { kind: 'choice'; values: string[] }
  | { kind: 'fields'; values: Record<string, string | number | boolean> }
  | { kind: 'dismissed' };
```

`choice` always answers with an array, so single and multiple share one
shape. `dismissed` is its own kind, so "No" and "did not answer" stay apart.

### Rules shared by renderers

Beside `hasPreviewContent` and `continuesGroup`:

```ts
/** The status, with the default applied. */
export function promptStatus(prompt: ChatPrompt): ChatPromptStatus;

/** Open, and addressed to `me` or to nobody in particular. */
export function canAnswerPrompt(prompt: ChatPrompt, me?: string): boolean;

/** The receipt's text: "Yes", "Bokmål, Nynorsk", "Seats: 3 · Name: Kari". */
export function describePromptResponse(
  prompt: ChatPrompt,
  response: ChatPromptResponse,
  labels: { confirm: string; decline: string; dismissed: string },
): string;
```

### On the message

```ts
export interface ChatLogMessage {
  // ...
  /** A question the reader answers in the message, shown under the text. */
  prompt?: ChatPrompt;
}
```

## Web: `@eventuras/ratio-ui/chat`

### `Chat.Prompt`

Exported as `ChatPrompt`, beside `ChatLog`. Usable on its own, so an app can
also pin the open prompt above its composer.
`Chat.Log` renders the same component under the text of a message.

```ts
/** @beta */
export interface ChatPromptProps {
  prompt: ChatPrompt;
  /** Called with the answer. Without it the prompt is read-only. */
  onRespond?: (response: ChatPromptResponse) => void;
  /** Your own nick, checked against `prompt.to`. */
  me?: string;
  /** Built-in text. Each entry falls back to English. */
  labels?: ChatPromptLabels;
  className?: string;
  testId?: string;
}

/** @beta */
export interface ChatPromptLabels {
  /** @default 'OK' */
  confirm?: string;
  /** @default 'Cancel' */
  decline?: string;
  /** @default 'Send' */
  submit?: string;
  /** @default 'Skip' */
  dismiss?: string;
  /** Receipt of a dismissed prompt. @default 'Skipped' */
  dismissed?: string;
  /** @default (answer, nick) => nick ? `${nick} answered: ${answer}` : `Answered: ${answer}` */
  answered?: (answer: string, nick?: string) => string;
  /** Shown to everyone but the nick in `prompt.to`. @default nick => `Waiting for ${nick}` */
  waitingFor?: (nick: string) => string;
  /** A closed prompt with no `closedNote`. @default 'No longer open' */
  closed?: string;
  /** Accessible name of a prompt with no `title`. @default 'Question' */
  prompt?: string;
}
```

Labels on the prompt (`confirmLabel`, `submitLabel`) win over `labels`: the
agent knows whether it is asking "Delete?" or "Book?", the app only knows its
language.

### `Chat.Log`

```ts
export interface ChatLogProps {
  // ...
  /**
   * Called with the message and the answer when the reader answers its
   * prompt. Without it prompts are read-only.
   */
  onRespond?: (messageId: string, response: ChatPromptResponse) => void;
}

export interface ChatLogLabels extends ChatPromptLabels {
  // ...
}
```

The log passes `onRespond.bind(null, id)` to the prompt, as it does for
`onToggleReaction`, so a Server Action still crosses into the client.

### What each state shows

| Status | Shows | Controls |
| --- | --- | --- |
| `open`, may answer | title, description, controls | live |
| `open`, addressed to someone else | title, description, `labels.waitingFor` | none |
| `sending` | as `open`; the pressed button shows `loading` | disabled |
| `answered` | title and the receipt from `describePromptResponse` | removed |
| `closed` | title and `closedNote` or `labels.closed` | removed |

Controls are removed after the answer, not disabled: a row of dead buttons is
noise for a screen reader and reads as a question still open.

### Which controls

- `confirm`: two `Button`s, `size="sm"`. Confirm is `primary`, or `danger`
  with `tone: 'danger'`; decline is `secondary`.
- `choice`: one `secondary` button per option, answered on press. With
  `multiple`, or when an option has a `description`, a list of checkboxes or
  radios and a submit button.
- `fields`: `TextField`, `NumberField`, `Switch` and `Select` from `forms`,
  in a `<form>`, with a submit button.

### Where the draft lives

The half-typed answer lives in the form's own controls and is read on submit.
`Chat.Prompt` keeps no React state for it and the caller gets no `onChange`
per keystroke. Once `onRespond` fires, the caller sets `status: 'sending'`
and `response`, then `answered`. A rejected submit goes back to `open` with
`errors` set.

```tsx
<ChatLog
  messages={messages}
  me="kari"
  onRespond={async (id, response) => {
    patch(id, { status: 'sending', response });
    await agent.answer(id, response);
    patch(id, { status: 'answered', answeredBy: 'kari' });
  }}
/>
```

A prompt from an agent is a tool call: its input becomes `message.prompt`,
and `onRespond` returns the tool's result.

## Accessibility

- The prompt is a `role="group"` named by its `title`, or by `labels.prompt`.
- `Chat.Log` is `role="log"`, so a new prompt is announced like any message.
  It never takes focus when it arrives.
- Nothing answers from the keyboard without focus on a control: no autofocus,
  no shortcuts. Enter submits a `fields` prompt from a single-line field, as
  in any form.
- After the answer, focus moves to the prompt's root if it was inside it, so
  it lands on the receipt and not on `<body>`.
- A `danger` confirm says so in its label; colour alone does not carry it.
- `onActivate` ignores taps on `a, button` today. It must also ignore taps
  inside a prompt, or tapping a field would toggle the message's bar.

## Native: `@eventuras/ratio-ui-native`

`confirm` and single `choice` need only `Button`, which exists. `fields` and
multiple `choice` wait for an input and a checkbox. Until then, and for any
`kind` a renderer does not know, the rule is the same on every platform: show
the title and description, no controls, and never throw. That is what makes
it safe to add kinds later.

## Not in scope

- Validation beyond `required`, the field's own type and caller-supplied `errors`.
- Conditional fields, steps, file uploads, date pickers.
- Free-text "Other" on a `choice`. A new option on `ChatChoicePrompt` can add it later.
- Arbitrary agent-authored UI. A prompt is one of the listed kinds.
- A composer, or pinning the open prompt above it. The app places `Chat.Prompt`.

## Suggested order

1. Types and rules in core; `Chat.Prompt` with `confirm` and single `choice`;
   the four states; `Chat.Log` wiring; stories and play tests. Native gets
   the same two kinds.
2. Multiple `choice` and `fields` on the web.
3. `fields` on native, when it has an input.

## Open questions

1. **Name.** "Prompt" also means what you send a model. `Chat.Ask` or
   `Chat.Request` avoid that. This draft keeps `Prompt`, the older UI sense.
2. **Addressing.** `to` and `answeredBy` matter in a channel with several
   people. If prompts only appear in one-to-one agent chats for now, both can
   wait; they are optional either way.
3. **Single choice on press.** One press answers and cannot be undone in the
   log. The alternative is select, then submit, for every choice.
4. **Changing an answer.** The data allows it (set `status` back to `open`),
   but the draft has no "Change" control.
5. **Drafts on native.** `FlatList` unmounts rows that scroll away, so a
   half-typed `fields` prompt would lose its draft. Native may need a
   controlled `draft` / `onDraftChange` pair.
