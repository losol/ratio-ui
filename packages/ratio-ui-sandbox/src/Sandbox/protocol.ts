// @eventuras/ratio-ui-sandbox · isolated frames for interactive examples
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The messages `Sandbox` and the frame exchange. The frame's side lives in
// `scripts/frame.js`, which is shipped as-is and cannot import this file: a
// test keeps the two in step.

/** `source` tag on messages the frame posts to the host. */
export const SANDBOX_FRAME_SOURCE = 'ratio-ui-sandbox';
/** `source` tag on messages the host posts into the frame. */
export const SANDBOX_HOST_SOURCE = 'ratio-ui-sandbox-host';

/** What the frame tells the host. */
export type SandboxFrameMessage =
  /** The frame has loaded and waits for code. */
  | { type: 'hello' }
  /** The code has been imported and handed to React. */
  | { type: 'ready' }
  /** The content's height in px changed. */
  | { type: 'resize'; height: number }
  /** The code failed to load or render. */
  | { type: 'error'; message: string };

/** What the host tells the frame. */
export type SandboxHostMessage =
  | {
      source: typeof SANDBOX_HOST_SOURCE;
      type: 'run';
      code: string;
      props: Record<string, unknown>;
      lang?: string;
      theme?: string;
      colorScheme?: string;
    }
  | {
      source: typeof SANDBOX_HOST_SOURCE;
      type: 'theme';
      theme?: string;
      colorScheme?: string;
    };

/** Reads a message from the frame, or `null` when it is not one. */
export const readFrameMessage = (data: unknown): SandboxFrameMessage | null => {
  if (typeof data !== 'object' || data === null) return null;
  const message = data as Record<string, unknown>;
  if (message.source !== SANDBOX_FRAME_SOURCE) return null;
  if (message.type === 'hello') return { type: 'hello' };
  if (message.type === 'ready') return { type: 'ready' };
  if (message.type === 'resize' && typeof message.height === 'number') {
    return { type: 'resize', height: message.height };
  }
  if (message.type === 'error') return { type: 'error', message: String(message.message) };
  return null;
};
