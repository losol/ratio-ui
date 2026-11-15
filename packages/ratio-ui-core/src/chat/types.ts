// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The chat's data, shared by every renderer: what a message is, not how it
// looks. The web's Chat.Log and a native chat log take the same shape.

/**
 * Channel role, shown as a glyph before the nick: `@` op, `+` voice.
 * @beta Shape may change before release.
 */
export type ChatRole = 'op' | 'voice';

/** @beta Shape may change before release. */
export interface ChatReaction {
  emoji: string;
  count: number;
  /** You are among the people who reacted. */
  me?: boolean;
}

/**
 * A card for a link in a message. The caller fetches it; renderers only
 * show it.
 * @beta Shape may change before release.
 */
export interface ChatLinkPreview {
  /** The link the card opens. */
  url: string;
  title?: string;
  description?: string;
  /** Shown as the card's small label; the URL's host when absent. */
  siteName?: string;
  /**
   * Already an http(s) URL the client can load. Renderers show it as a
   * fixed square thumbnail, so `width` and `height` are the source image's
   * dimensions for the caller's own use; renderers do not read them.
   */
  image?: { src: string; width?: number; height?: number };
}

/** @beta Shape may change before release. */
export interface ChatLogMessage {
  id: string;
  /** Row kind. @default 'msg' */
  type?: 'msg' | 'event' | 'action' | 'divider';
  /** Display time, formatted by the caller, e.g. `'09:42'`. */
  time?: string;
  /**
   * When it was sent, as a `Date` or epoch milliseconds. Never shown;
   * read to group messages, which split after a five-minute pause.
   * @beta May change before release.
   */
  timestamp?: Date | number;
  /** Author of a `msg` or an `action`. */
  nick?: string;
  role?: ChatRole;
  /**
   * The message; `@nick` mentions are highlighted and http(s) URLs become
   * links. A divider's label.
   */
  text: string;
  /** A card for a link in the message, shown under the text. */
  preview?: ChatLinkPreview;
  /** The message's own address; the time becomes a link to it. */
  href?: string;
  /** Emoji reactions, shown under a `msg`. */
  reactions?: ChatReaction[];
  /**
   * A question the reader answers in the message, shown under the text.
   * `text` should still ask it: a renderer that does not know the prompt's
   * `kind` shows no controls.
   * @beta May change before release.
   */
  prompt?: ChatPrompt;
}

/**
 * Where a prompt is in its life: `open` takes an answer, `sending` has one
 * on its way, `answered` shows it as a receipt, and `closed` no longer
 * takes one.
 * @beta Shape may change before release.
 */
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

/**
 * Confirm or decline: OK/Cancel, Yes/No, Approve/Reject.
 * @beta Shape may change before release.
 */
export interface ChatConfirmPrompt extends ChatPromptBase {
  kind: 'confirm';
  /** The confirming button's text; the renderer's own label when absent. */
  confirmLabel?: string;
  /** The declining button's text; the renderer's own label when absent. */
  declineLabel?: string;
  /** `danger` when confirming cannot be undone. @default 'default' */
  tone?: 'default' | 'danger';
}

/** @beta Shape may change before release. */
export interface ChatPromptOption {
  /** What the response carries. */
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Pick one option, or several with `multiple`, then send.
 * @beta Shape may change before release.
 */
export interface ChatChoicePrompt extends ChatPromptBase {
  kind: 'choice';
  options: ChatPromptOption[];
  /** Several may be picked. @default false */
  multiple?: boolean;
  /** The sending button's text; the renderer's own label when absent. */
  submitLabel?: string;
}

/**
 * A small form inside a message. More kinds may follow, so a renderer
 * shows the title and description of a `kind` it does not know, and no
 * controls.
 * @beta Shape may change before release.
 */
export type ChatPrompt = ChatConfirmPrompt | ChatChoicePrompt;

/**
 * The reader's answer to a prompt. A `choice` answers with its options'
 * values in the options' order, one of them unless the prompt is
 * `multiple`. `dismissed` is "did not answer", apart from a declined
 * `confirm`.
 * @beta Shape may change before release.
 */
export type ChatPromptResponse =
  | { kind: 'confirm'; accepted: boolean }
  | { kind: 'choice'; values: string[] }
  | { kind: 'dismissed' };
