// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useId, useRef, useState } from 'react';
import {
  describePromptResponse,
  promptStatus,
  type ChatChoicePrompt,
  type ChatConfirmPrompt,
  type ChatPrompt as ChatPromptData,
  type ChatPromptOption,
  type ChatPromptResponse,
  type ChatPromptStatus,
} from '@eventuras/ratio-ui-core/chat';
import { Button } from '../core/Button';
import { Check } from '../icons';
import { cn } from '../utils/cn';

// The prompt's shape and the rules for reading it live in ratio-ui-core,
// shared with the native renderer; re-exported so `ratio-ui/chat` keeps them.
export type {
  ChatChoicePrompt,
  ChatConfirmPrompt,
  ChatPromptOption,
  ChatPromptResponse,
  ChatPromptStatus,
};

/**
 * The prompt's data, under the name it has in ratio-ui-core. A type and the
 * component can share a name, so `ChatPrompt` is both here: what you render
 * and the type of what you hand it.
 * @beta Shape may change before release.
 */
export type ChatPrompt = ChatPromptData;

/**
 * Built-in text of `Chat.Prompt`. Each entry falls back to English. All
 * plain strings, so a server component can pass them.
 * @beta
 */
export interface ChatPromptLabels {
  /** The confirming button of a `confirm` with no `confirmLabel`. @default 'OK' */
  confirm?: string;
  /** The declining button of a `confirm` with no `declineLabel`. @default 'Cancel' */
  decline?: string;
  /** The sending button of a `choice` with no `submitLabel`. @default 'Send' */
  submit?: string;
  /** The button of a `dismissible` prompt. @default 'Skip' */
  dismiss?: string;
  /** The receipt's answer when the prompt was dismissed. @default 'Skipped' */
  dismissed?: string;
  /** Leads the receipt, before the answer. @default 'Answered' */
  answered?: string;
  /** A closed prompt with no `closedNote`. @default 'No longer open' */
  closed?: string;
  /** Accessible name of a prompt with no `title`. @default 'Question' */
  question?: string;
}

/** @beta Prop shape may change before release. */
export interface ChatPromptProps {
  prompt: ChatPromptData;
  /**
   * Called with the answer. The caller then updates `prompt`: `status:
   * 'sending'` with the `response` while it is on its way, `answered` once
   * it has arrived. Without it the prompt is read-only.
   */
  onRespond?: (response: ChatPromptResponse) => void;
  /** Built-in text. Each entry falls back to English. */
  labels?: ChatPromptLabels;
  className?: string;
  testId?: string;
}

const ACTIONS = 'flex flex-wrap items-center gap-2';

type Respond = (response: ChatPromptResponse) => void;

type ControlsProps<P> = {
  prompt: P;
  sending: boolean;
  respond: Respond;
  labels: Required<ChatPromptLabels>;
};

/** "Skip", on a prompt that may be left unanswered. */
const Dismiss: React.FC<ControlsProps<ChatPromptData>> = ({ prompt, sending, respond, labels }) =>
  prompt.dismissible ? (
    <Button
      variant="text"
      size="sm"
      isDisabled={sending}
      loading={sending && prompt.response?.kind === 'dismissed'}
      onPress={() => respond({ kind: 'dismissed' })}
    >
      {labels.dismiss}
    </Button>
  ) : null;

/** Confirm and decline: one press answers. */
const ConfirmControls: React.FC<ControlsProps<ChatConfirmPrompt>> = ({
  prompt,
  sending,
  respond,
  labels,
}) => {
  const sent = prompt.response?.kind === 'confirm' ? prompt.response.accepted : undefined;
  return (
    <div className={ACTIONS}>
      <Button
        // A danger says so in its label too, which the prompt brings.
        variant={prompt.tone === 'danger' ? 'danger' : 'primary'}
        size="sm"
        isDisabled={sending}
        loading={sending && sent === true}
        onPress={() => respond({ kind: 'confirm', accepted: true })}
      >
        {prompt.confirmLabel || labels.confirm}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        isDisabled={sending}
        loading={sending && sent === false}
        onPress={() => respond({ kind: 'confirm', accepted: false })}
      >
        {prompt.declineLabel || labels.decline}
      </Button>
      <Dismiss prompt={prompt} sending={sending} respond={respond} labels={labels} />
    </div>
  );
};

/**
 * Pick, then send: radios, or checkboxes with `multiple`. The picks are
 * the form's own until they are sent, so a slip of the finger answers
 * nothing; the sending button waits for the first pick.
 */
const ChoiceControls: React.FC<ControlsProps<ChatChoicePrompt>> = ({
  prompt,
  sending,
  respond,
  labels,
}) => {
  const id = useId();
  const { options, multiple = false } = prompt;
  // An answer on its way is still picked if the form mounts while it is sent.
  const [picked, setPicked] = useState<string[]>(() =>
    prompt.response?.kind === 'choice' ? prompt.response.values : [],
  );
  // In the options' order, and without a value the prompt no longer offers.
  const values = options.filter(option => picked.includes(option.value)).map(option => option.value);

  const toggle = (value: string, on: boolean) =>
    setPicked(current =>
      multiple ? (on ? [...current, value] : current.filter(v => v !== value)) : [value],
    );

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={event => {
        event.preventDefault();
        if (values.length > 0) respond({ kind: 'choice', values });
      }}
    >
      <div className="flex flex-col">
        {options.map((option, i) => {
          const disabled = sending || !!option.disabled;
          return (
            <label
              key={option.value}
              className={cn(
                '-mx-1.5 flex items-start gap-2 rounded px-1.5 py-1',
                disabled
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:bg-(--chat-row-hover-bg)',
              )}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={id}
                value={option.value}
                checked={picked.includes(option.value)}
                disabled={disabled}
                onChange={event => toggle(option.value, event.target.checked)}
                // The label alone is the name; the description is read after it.
                aria-labelledby={`${id}-${i}-label`}
                aria-describedby={option.description ? `${id}-${i}-description` : undefined}
                // Centred on the label's first line, whatever the log's text size.
                className="mt-[calc((1lh-1rem)/2)] size-4 shrink-0 accent-(--primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
              />
              <span className="flex min-w-0 flex-col">
                <span id={`${id}-${i}-label`} className="break-words">
                  {option.label}
                </span>
                {option.description && (
                  <span
                    id={`${id}-${i}-description`}
                    className="text-[0.8125rem] leading-snug break-words text-(--text-muted)"
                  >
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      <div className={ACTIONS}>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isDisabled={sending || values.length === 0}
          loading={sending && prompt.response?.kind === 'choice'}
        >
          {prompt.submitLabel || labels.submit}
        </Button>
        <Dismiss prompt={prompt} sending={sending} respond={respond} labels={labels} />
      </div>
    </form>
  );
};

/** What was asked, for a reader who cannot answer: the options, as a list. */
const ChoiceReadOnly: React.FC<{ options: ChatPromptOption[] }> = ({ options }) => (
  <ul className="m-0 flex list-disc flex-col gap-0.5 pl-5">
    {options.map(option => (
      <li key={option.value} className="break-words">
        {option.label}
        {option.description && (
          <span className="block text-[0.8125rem] leading-snug text-(--text-muted)">
            {option.description}
          </span>
        )}
      </li>
    ))}
  </ul>
);

/**
 * Chat.Prompt — a small form in a message: confirm or decline, or pick from
 * a few options and send. It is the prompt's data that says where it is in
 * its life. An `open` prompt shows its controls; `sending` holds them while
 * the answer is on its way; `answered` replaces them with a receipt, since
 * a log is history and a question is answered once; `closed` says it no
 * longer takes an answer.
 *
 * Controlled: it reports the answer and waits for a new `prompt`. Only the
 * picks of a `choice` are its own, until they are sent. It never takes
 * focus when it arrives. A `kind` it does not know shows its title and
 * description, and no controls.
 *
 * `Chat.Log` renders it under a message's text; on its own it can sit
 * above a composer, for the question that is still open.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const ChatPrompt: React.FC<ChatPromptProps> = ({
  prompt,
  onRespond,
  labels,
  className,
  testId,
}) => {
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const l: Required<ChatPromptLabels> = {
    confirm: labels?.confirm ?? 'OK',
    decline: labels?.decline ?? 'Cancel',
    submit: labels?.submit ?? 'Send',
    dismiss: labels?.dismiss ?? 'Skip',
    dismissed: labels?.dismissed ?? 'Skipped',
    answered: labels?.answered ?? 'Answered',
    closed: labels?.closed ?? 'No longer open',
    question: labels?.question ?? 'Question',
  };

  const { title, description, response } = prompt;
  const status = promptStatus(prompt);
  const sending = status === 'sending';
  const takesAnswer = status === 'open' || sending;

  const respond: Respond = answer => {
    // The pressed control is about to be disabled, then removed, and focus
    // would fall to the page with it. The prompt's root stays, so focus
    // waits there, where the receipt appears. Without a scroll: the reader
    // is already looking at it.
    rootRef.current?.focus({ preventScroll: true });
    onRespond?.(answer);
  };

  // By `kind` at run time: the data may come from an agent that knows kinds
  // this version does not.
  const kind: string = prompt.kind;
  let body: React.ReactNode = null;
  if (status === 'answered') {
    const answer = response ? describePromptResponse(prompt, response, l) : '';
    body = (
      <p className="m-0 flex items-start gap-1.5">
        <Check aria-hidden className="mt-[calc((1lh-1rem)/2)] size-4 shrink-0 text-(--text-muted)" />
        {/* Told apart by weight, not punctuation, which differs by language. */}
        <span className="min-w-0 break-words">
          <span className="text-(--text-muted)">{l.answered}</span>
          {answer && <> <span className="font-semibold">{answer}</span></>}
        </span>
      </p>
    );
  } else if (status === 'closed') {
    body = <p className="m-0 text-(--text-muted) italic">{prompt.closedNote || l.closed}</p>;
  } else if (takesAnswer && kind === 'confirm' && onRespond) {
    body = (
      <ConfirmControls
        prompt={prompt as ChatConfirmPrompt}
        sending={sending}
        respond={respond}
        labels={l}
      />
    );
  } else if (takesAnswer && kind === 'choice') {
    const choice = prompt as ChatChoicePrompt;
    body = onRespond ? (
      <ChoiceControls prompt={choice} sending={sending} respond={respond} labels={l} />
    ) : (
      <ChoiceReadOnly options={choice.options} />
    );
  }

  // Nothing to say: a read-only confirm, or an unknown kind, with no title.
  if (!title && !description && !body) return null;

  return (
    <div
      ref={rootRef}
      role="group"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : l.question}
      aria-busy={sending || undefined}
      // Reachable by `respond` alone, never by Tab.
      tabIndex={-1}
      data-status={status}
      data-testid={testId}
      className={cn(
        // The link preview's frame, so what hangs under a message looks alike.
        'flex max-w-[30rem] flex-col gap-2 rounded-md border border-border-1 bg-(--chat-bubble-bg) p-2.5 text-(--text)',
        // In a narrow log the text column is the row, so the prompt spans it.
        '@max-lg/chat:max-w-none',
        'focus-visible:ring-2 focus-visible:ring-(--focus-ring) focus-visible:outline-none',
        className,
      )}
    >
      {(title || description) && (
        <div className="flex flex-col gap-0.5">
          {title && (
            <p id={titleId} className="m-0 leading-snug font-semibold break-words">
              {title}
            </p>
          )}
          {description && (
            <p className="m-0 text-[0.8125rem] leading-snug break-words text-(--text-muted)">
              {description}
            </p>
          )}
        </div>
      )}
      {body}
    </div>
  );
};
ChatPrompt.displayName = 'Chat.Prompt';
