# Chat.Prompt API Design

**Status:** Step 1 is built: `confirm` and `choice` on the web. The rest is a proposal.
**Date:** 2026-11-15

A prompt is a small form inside a chat message: confirm or decline, pick from
a few options, fill in a couple of fields. Agents use them to ask the reader
a question the reader can answer in the log. This note covers the data in
`@eventuras/ratio-ui-core/chat`, `Chat.Prompt` on the web, and how `Chat.Log`
carries it.

## Principles

1. **Data, not JSX.** A prompt is a plain object on the message, like
   `preview`. An agent can produce it from a tool call, and the web and native
   renderers read the same shape.
2. **A prompt has a life.** A chat log is history. An answered prompt becomes
   a receipt and stays in the log as one.
3. **The caller owns the state.** `Chat.Log` reports the answer through
   `onRespond` and the caller updates the message, as with `onToggleReaction`
   and `onActivate`.
4. **Small on purpose.** A few kinds, a handful of options or fields, no
   validation engine and no JSON Schema. Anything larger opens a `Dialog` or
   `Drawer`.
5. **Readable without the prompt.** The message's `text` still asks the
   question, so notifications, older clients and unknown kinds lose the
   controls but not the meaning.

## Decisions

| Question | Decision |
| --- | --- |
| Name | `Chat.Prompt`. |
| Who may see and who may answer | Not yet. It belongs with a later poll, and gets its own props then. |
| How a `choice` is answered | Pick, then send, for every choice. One press never answers a choice. |
| Changing an answer | Later. An answered prompt has no "Change" control. |
| Native | Waits, see [Native](#native-eventurasratio-ui-native). |

## Built: step 1

### Data: `@eventuras/ratio-ui-core/chat`

```ts
export type ChatPromptStatus = 'open' | 'sending' | 'answered' | 'closed';

interface ChatPromptBase {
  /** A heading over the controls. The message's `text` should still ask the question. */
  title?: string;
  description?: string;
  /** @default `'answered'` when there is a `response`, else `'open'` */
  status?: ChatPromptStatus;
  /** The answer given: the receipt once answered, and what is on its way while `sending`. */
  response?: ChatPromptResponse;
  /** Adds a "Skip" button, which answers `{ kind: 'dismissed' }`. */
  dismissible?: boolean;
  /** Why a `closed` prompt closed, e.g. `'Expired'`. Shown as given. */
  closedNote?: string;
}

/** Confirm or decline: OK/Cancel, Yes/No, Approve/Reject. */
export interface ChatConfirmPrompt extends ChatPromptBase {
  kind: 'confirm';
  confirmLabel?: string;
  declineLabel?: string;
  /** `danger` when confirming cannot be undone. @default 'default' */
  tone?: 'default' | 'danger';
}

export interface ChatPromptOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Pick one option, or several with `multiple`, then send. */
export interface ChatChoicePrompt extends ChatPromptBase {
  kind: 'choice';
  options: ChatPromptOption[];
  /** @default false */
  multiple?: boolean;
  submitLabel?: string;
}

export type ChatPrompt = ChatConfirmPrompt | ChatChoicePrompt;

export type ChatPromptResponse =
  | { kind: 'confirm'; accepted: boolean }
  | { kind: 'choice'; values: string[] }
  | { kind: 'dismissed' };

export interface ChatLogMessage {
  // ...
  prompt?: ChatPrompt;
}
```

A `choice` always answers with an array, in the options' order, so single
and multiple share one shape. `dismissed` is its own kind, so "No" and "did
not answer" stay apart.

Two rules for every renderer, beside `hasPreviewContent` and `continuesGroup`:

```ts
/** The status, with the default applied. */
export function promptStatus(prompt: ChatPrompt): ChatPromptStatus;

/** The receipt's answer in words: "Yes", "Doors, Teardown", "Skipped". */
export function describePromptResponse(
  prompt: ChatPrompt,
  response: ChatPromptResponse,
  labels: { confirm: string; decline: string; dismissed: string },
): string;
```

### Web: `@eventuras/ratio-ui/chat`

`ChatPrompt` is exported beside `ChatLog`. The name is both the component
and the type of its data, so one import covers both.

```ts
export interface ChatPromptProps {
  prompt: ChatPrompt;
  /** Called with the answer. Without it the prompt is read-only. */
  onRespond?: (response: ChatPromptResponse) => void;
  labels?: ChatPromptLabels;
  className?: string;
  testId?: string;
}

/** All plain strings, so a server component can pass them. */
export interface ChatPromptLabels {
  confirm?: string; // 'OK'
  decline?: string; // 'Cancel'
  submit?: string; // 'Send'
  dismiss?: string; // 'Skip'
  dismissed?: string; // 'Skipped'
  answered?: string; // 'Answered', leads the receipt
  closed?: string; // 'No longer open'
  question?: string; // 'Question', names a prompt with no title
}
```

Labels on the prompt (`confirmLabel`, `submitLabel`) win over `labels`: the
agent knows whether it is asking "Delete?" or "Book?", the app only knows its
language.

`Chat.Log` renders the prompt under the message's text and link preview:

```ts
export interface ChatLogProps {
  // ...
  onRespond?: (messageId: string, response: ChatPromptResponse) => void;
}

export interface ChatLogLabels {
  // ...
  prompt?: ChatPromptLabels;
}
```

The log passes `onRespond.bind(null, id)` to the prompt, as it does for
`onToggleReaction`, so a Server Action still crosses into the client.
`Chat.MessageCard` shows a message's prompt read-only, with
`labels.prompt` for its text.

```tsx
<ChatLog
  messages={messages}
  me="kari"
  onRespond={async (id, response) => {
    patch(id, { status: 'sending', response });
    await agent.answer(id, response);
    patch(id, { status: 'answered' });
  }}
/>
```

A prompt from an agent is a tool call: its input becomes `message.prompt`,
and `onRespond` returns the tool's result.

### What each state shows

| Status | Shows | Controls |
| --- | --- | --- |
| `open`, with `onRespond` | title, description, controls | live |
| `open`, read-only | title, description, a choice's options as a list | none |
| `sending` | as `open`; the pressed button spins | held |
| `answered` | title, description, the receipt | removed |
| `closed` | title, description, `closedNote` or `labels.closed` | removed |

Controls are removed after the answer, not disabled: a row of dead buttons is
noise for a screen reader and reads as a question still open. A read-only
`confirm` with no title or description has nothing to show and renders
nothing. A `kind` the renderer does not know shows its title and description,
and no controls, which is what makes it safe to add kinds later.

### Which controls

- `confirm`: two `Button`s, `size="sm"`. One press answers. Confirm is
  `primary`, or `danger` with `tone: 'danger'`; decline is `secondary`.
- `choice`: radios, or checkboxes with `multiple`, and a "Send" button that
  waits for the first pick. The picks are the prompt's own state until they
  are sent; nothing else is.
- `dismissible`: a "Skip" button, `text` variant, after the others.

### Accessibility

- The prompt is a `role="group"` named by its `title`, or by `labels.question`.
- `Chat.Log` is `role="log"`, so a new prompt is announced like any message.
  It never takes focus when it arrives.
- Nothing answers without focus on a control: no autofocus, no shortcuts.
- An option's description is its accessible description, not part of its name.
- At the press, focus moves to the prompt's root, which stays while the
  pressed button is held and then removed. Focus lands where the receipt
  appears and not on `<body>`.
- A `danger` confirm says so in its label, which the prompt brings; colour
  alone does not carry it.
- `onActivate` ignores taps on a prompt's options and buttons, so answering
  on a phone does not toggle the message's bar.

## Proposed: step 2, `fields`

A couple of fields and a submit button, as a third kind:

```ts
export interface ChatFieldsPrompt extends ChatPromptBase {
  kind: 'fields';
  fields: ChatPromptField[];
  submitLabel?: string;
  /** Messages for fields the caller rejected, by field name. */
  errors?: Record<string, string>;
}

interface ChatPromptFieldBase {
  /** Key of the value in the response. */
  name: string;
  label: string;
  description?: string;
  required?: boolean;
}

export type ChatPromptField =
  | (ChatPromptFieldBase & {
      kind: 'text';
      defaultValue?: string;
      placeholder?: string;
      multiline?: boolean;
      format?: 'email' | 'url' | 'tel';
    })
  | (ChatPromptFieldBase & { kind: 'number'; defaultValue?: number; min?: number; max?: number; step?: number })
  | (ChatPromptFieldBase & { kind: 'toggle'; defaultValue?: boolean })
  | (ChatPromptFieldBase & { kind: 'select'; options: ChatPromptOption[]; defaultValue?: string });

// ChatPromptResponse gains:
// | { kind: 'fields'; values: Record<string, string | number | boolean> }
```

Text, number, toggle and select are the primitives a flat form needs. They
are meant to match what an MCP elicitation request allows (string, number,
boolean, enum), so one could be shown as a `fields` prompt; check that
against the specification before building on it.

Rendered with `TextField`, `NumberField`, `Switch` and `Select` from `forms`
in a `<form>`. The half-typed answer lives in the form's own controls and is
read on submit. A rejected submit goes back to `open` with `errors` set.

## Native: `@eventuras/ratio-ui-native`

Not built. `ChatLog` there ignores `prompt` for now, and the message's `text`
still asks the question. Two things to settle first:

- With pick-then-send, a `choice` holds picks before they are sent, and
  `FlatList` unmounts rows that scroll away. A half-answered prompt would
  lose its picks. Native may need a controlled `draft` / `onDraftChange`
  pair, or the caller's own store.
- `fields` needs an input, which the package does not have yet.

`confirm` needs only `Button` and could come first.

## Later

- **Who may see and who may answer.** Props for a prompt in a room with
  several people, and the tally that goes with it: a poll.
- **Changing an answer.** The data allows it (set `status` back to `open`);
  the control and the rules for it are not designed.
- **Free-text "Other"** on a `choice`.
- **Pinning the open prompt** above a composer. `Chat.Prompt` works on its
  own for that; the placement is the app's.

## Not in scope

- Validation beyond `required`, a field's own type and caller-supplied `errors`.
- Conditional fields, steps, file uploads, date pickers.
- Arbitrary agent-authored UI. A prompt is one of the listed kinds.
