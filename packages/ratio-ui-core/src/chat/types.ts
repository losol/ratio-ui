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
}
