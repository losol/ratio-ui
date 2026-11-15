// @eventuras/ratio-ui-sandbox · isolated frames for interactive examples
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  buildSandboxDocument,
  SANDBOX_FRAME_SOURCE,
  SANDBOX_HOST_SOURCE,
  type SandboxRuntime,
} from './buildSandboxDocument';

/** Built-in text of `Sandbox`. Each entry falls back to English. */
export interface SandboxLabels {
  /** Shown instead of the frame when the code fails. @default 'This interactive example could not be shown.' */
  error?: string;
}

export interface SandboxProps {
  /**
   * ES module source, already compiled to plain JavaScript (no JSX or
   * TypeScript). Its default export is rendered as a React component.
   */
  code: string;
  /** What the code may import. See `SandboxRuntime`. */
  runtime: SandboxRuntime;
  /** Accessible name of the frame. Describe what the example does. */
  title: string;
  /** JSON-serialisable props passed to the default export. */
  props?: Record<string, unknown>;
  /** `data-theme` in the frame. Defaults to the host page's own value. */
  theme?: string;
  /** `data-color-scheme` in the frame. Defaults to the host page's own value. */
  colorScheme?: string;
  /** Document language in the frame. @default 'en' */
  lang?: string;
  /** Height in px before the content has reported its own. @default 120 */
  minHeight?: number;
  /** Upper bound in px for the height the content may claim. @default 4000 */
  maxHeight?: number;
  /** Built-in text. Each entry falls back to English. */
  labels?: SandboxLabels;
  /** Fired with the error message when the code fails to load or render. */
  onError?: (message: string) => void;
  className?: string;
  testId?: string;
}

type FrameMessage =
  | { type: 'ready' }
  | { type: 'resize'; height: number }
  | { type: 'error'; message: string };

const readFrameMessage = (data: unknown, id: string): FrameMessage | null => {
  if (typeof data !== 'object' || data === null) return null;
  const message = data as Record<string, unknown>;
  if (message.source !== SANDBOX_FRAME_SOURCE || message.id !== id) return null;
  if (message.type === 'ready') return { type: 'ready' };
  if (message.type === 'resize' && typeof message.height === 'number') {
    return { type: 'resize', height: message.height };
  }
  if (message.type === 'error') return { type: 'error', message: String(message.message) };
  return null;
};

// Inline, so the component needs no stylesheet of its own. The tokens are
// Ratio UI's; without them the text falls back to the page's own colours.
const errorStyle: React.CSSProperties = {
  margin: 0,
  padding: '1rem',
  border: '1px solid var(--border-1, currentColor)',
  borderRadius: '0.375rem',
  color: 'var(--text-muted, inherit)',
  fontSize: '0.875rem',
};

const hostTheme = (): { theme?: string; colorScheme?: string } => {
  const { theme, colorScheme } = document.documentElement.dataset;
  return { theme, colorScheme };
};

/**
 * Runs a piece of React code in an isolated frame, so content authors can
 * embed small interactive examples without the code reaching the page around
 * it.
 *
 * The frame is `sandbox="allow-scripts"` and nothing else: it has no origin,
 * so the code cannot read the page, its cookies or its storage, cannot
 * navigate it and cannot open windows. A Content-Security-Policy inside the
 * frame also stops it from calling out over the network. The frame grows to
 * fit its content and follows the page's theme.
 *
 * The code must be compiled JavaScript: compile JSX and TypeScript where the
 * content is saved, not here.
 *
 * @example
 * ```tsx
 * <Sandbox
 *   title="Counter"
 *   runtime={runtime}
 *   code={`
 *     import { createElement, useState } from 'react';
 *     export default function Counter() {
 *       const [n, setN] = useState(0);
 *       return createElement('button', { onClick: () => setN(n + 1) }, 'Clicked ' + n);
 *     }
 *   `}
 * />
 * ```
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export const Sandbox: React.FC<SandboxProps> = ({
  code,
  runtime,
  title,
  props,
  theme,
  colorScheme,
  lang,
  minHeight = 120,
  maxHeight = 4000,
  labels,
  onError,
  className,
  testId,
}) => {
  const id = useId();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const onErrorRef = useRef(onError);
  const [height, setHeight] = useState(minHeight);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  // A new document means a new run: forget the previous one's outcome.
  const propsJson = JSON.stringify(props ?? {});
  const runKey = JSON.stringify([code, propsJson, runtime]);
  const [lastRunKey, setLastRunKey] = useState(runKey);
  if (lastRunKey !== runKey) {
    setLastRunKey(runKey);
    setFailed(false);
    setReady(false);
    setHeight(minHeight);
  }

  // The theme a document starts with is fixed when it is built. Later changes
  // are posted into the frame, so switching theme does not reload the example.
  const [initialTheme] = useState({ theme, colorScheme });

  const srcDoc = useMemo(() => {
    try {
      return buildSandboxDocument({
        id,
        code,
        runtime,
        props: JSON.parse(propsJson) as Record<string, unknown>,
        lang,
        theme: initialTheme.theme,
        colorScheme: initialTheme.colorScheme,
      });
    } catch {
      return null;
    }
    // `runtime` is compared by value through `runKey`, so a new object with
    // the same content does not reload the frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, code, runKey, propsJson, lang, initialTheme]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      const message = readFrameMessage(event.data, id);
      if (!message) return;
      if (message.type === 'ready') setReady(true);
      if (message.type === 'resize') {
        setHeight(Math.min(Math.max(message.height, minHeight), maxHeight));
      }
      if (message.type === 'error') {
        setFailed(true);
        onErrorRef.current?.(message.message);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [id, minHeight, maxHeight]);

  // Keep the frame on the page's theme: explicit props win, otherwise mirror
  // the attributes on the host's <html> and follow them when they change.
  useEffect(() => {
    if (!ready) return;
    const send = () => {
      const host = hostTheme();
      frameRef.current?.contentWindow?.postMessage(
        {
          source: SANDBOX_HOST_SOURCE,
          type: 'theme',
          theme: theme ?? host.theme,
          colorScheme: colorScheme ?? host.colorScheme,
        },
        // The frame has no origin to name. The message holds nothing secret.
        '*',
      );
    };
    send();
    const observer = new MutationObserver(send);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-color-scheme'],
    });
    return () => observer.disconnect();
  }, [ready, theme, colorScheme]);

  if (failed || srcDoc === null) {
    return (
      <p role="alert" className={className} style={errorStyle} data-testid={testId}>
        {labels?.error ?? 'This interactive example could not be shown.'}
      </p>
    );
  }

  return (
    <iframe
      ref={frameRef}
      title={title}
      srcDoc={srcDoc}
      // Never add allow-same-origin: together with allow-scripts it would let
      // the code remove the sandbox and act as the page.
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      loading="lazy"
      className={className}
      style={{ display: 'block', width: '100%', border: 0, height }}
      data-testid={testId}
    />
  );
};
