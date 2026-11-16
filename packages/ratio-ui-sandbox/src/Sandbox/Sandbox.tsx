// @eventuras/ratio-ui-sandbox · isolated frames for interactive examples
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { readFrameMessage, SANDBOX_HOST_SOURCE, type SandboxHostMessage } from './protocol';

/** Built-in text of `Sandbox`. Each entry falls back to English. */
export interface SandboxLabels {
  /** Shown instead of the frame when the code fails. @default 'This interactive example could not be shown.' */
  error?: string;
}

export interface SandboxProps {
  /**
   * Absolute URL of the runtime's `frame.html`, served from the sandbox
   * origin. That origin must differ from the page's own — the component
   * refuses to start otherwise.
   */
  src: string;
  /**
   * ES module source, already compiled to plain JavaScript (no JSX or
   * TypeScript). Its default export is rendered as a React component.
   */
  code: string;
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
  /** How long in ms a loaded frame may take to start the code. @default 15000 */
  timeout?: number;
  /** Built-in text. Each entry falls back to English. */
  labels?: SandboxLabels;
  /** Fired with the error message when the code fails to load or render. */
  onError?: (message: string) => void;
  className?: string;
  testId?: string;
}

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

const frameOriginOf = (src: string): string | null => {
  try {
    const url = new URL(src);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : null;
  } catch {
    return null;
  }
};

// The page's origin never changes, but it is unknown on the server: reading
// it through an external store keeps server and first client render equal.
const subscribeToNothing = () => () => {};
const pageOrigin = () => window.location.origin;
const noPageOrigin = () => null;

/**
 * Runs a piece of React code in a frame on another origin, so content authors
 * can embed small interactive examples without the code reaching the page
 * around it.
 *
 * The frame is `frame.html` from this package's runtime, served from a
 * separate sandbox origin. The browser's same-origin policy keeps the code
 * away from the page, its cookies and its storage; the frame's sandbox
 * attribute stops it from navigating the page, opening windows or submitting
 * forms; and a Content-Security-Policy in the frame stops it from calling out
 * over the network. The frame grows to fit its content and follows the page's
 * theme.
 *
 * The code must be compiled JavaScript: compile JSX and TypeScript where the
 * content is saved, not here.
 *
 * @example
 * ```tsx
 * <Sandbox
 *   src="https://sandbox.example/0.1.0/frame.html"
 *   title="Counter"
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
 * @alpha Experimental — the API may change or be removed without notice.
 */
export const Sandbox: React.FC<SandboxProps> = ({
  src,
  code,
  title,
  props,
  theme,
  colorScheme,
  lang,
  minHeight = 120,
  maxHeight = 4000,
  timeout = 15_000,
  labels,
  onError,
  className,
  testId,
}) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onErrorRef = useRef(onError);
  const [height, setHeight] = useState(minHeight);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const hostOrigin = useSyncExternalStore(subscribeToNothing, pageOrigin, noPageOrigin);
  const frameOrigin = frameOriginOf(src);

  // Each run gets a fresh frame: forget the previous run's outcome.
  const propsJson = JSON.stringify(props ?? {});
  const runKey = JSON.stringify([src, code, propsJson, lang]);
  const [lastRunKey, setLastRunKey] = useState(runKey);
  if (lastRunKey !== runKey) {
    setLastRunKey(runKey);
    setFailed(false);
    setReady(false);
    setHeight(minHeight);
  }

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!frameOrigin) return;
    const post = (message: SandboxHostMessage) =>
      frameRef.current?.contentWindow?.postMessage(message, frameOrigin);

    const onMessage = (event: MessageEvent) => {
      // Only the frame this component rendered, and only while it still shows
      // the sandbox: a frame that has navigated elsewhere has another origin.
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.origin !== frameOrigin) return;
      const message = readFrameMessage(event.data);
      if (!message) return;

      if (message.type === 'hello') {
        const host = hostTheme();
        post({
          source: SANDBOX_HOST_SOURCE,
          type: 'run',
          code,
          props: JSON.parse(propsJson) as Record<string, unknown>,
          lang,
          theme: theme ?? host.theme,
          colorScheme: colorScheme ?? host.colorScheme,
        });
      }
      if (message.type === 'ready') {
        clearTimeout(timerRef.current);
        setReady(true);
      }
      if (message.type === 'resize') {
        setHeight(Math.min(Math.max(message.height, minHeight), maxHeight));
      }
      if (message.type === 'error') {
        clearTimeout(timerRef.current);
        setFailed(true);
        onErrorRef.current?.(message.message);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // Theme is read when the frame says hello; later changes are posted by
    // the effect below, so they must not re-subscribe this listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameOrigin, code, propsJson, lang, minHeight, maxHeight]);

  // Keep the frame on the page's theme: explicit props win, otherwise mirror
  // the attributes on the host's <html> and follow them when they change.
  useEffect(() => {
    if (!ready || !frameOrigin) return;
    const send = () => {
      const host = hostTheme();
      const message: SandboxHostMessage = {
        source: SANDBOX_HOST_SOURCE,
        type: 'theme',
        theme: theme ?? host.theme,
        colorScheme: colorScheme ?? host.colorScheme,
      };
      frameRef.current?.contentWindow?.postMessage(message, frameOrigin);
    };
    send();
    const observer = new MutationObserver(send);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-color-scheme'],
    });
    return () => observer.disconnect();
  }, [ready, frameOrigin, theme, colorScheme]);

  useEffect(() => () => clearTimeout(timerRef.current), [runKey]);

  // A frame that has loaded but never starts the code is a broken runtime, a
  // wrong URL or a blocked script. The clock starts at load, not at render,
  // because a lazy frame does not load until it is near the viewport.
  const onLoad = () => {
    clearTimeout(timerRef.current);
    if (ready) return;
    timerRef.current = setTimeout(() => {
      setFailed(true);
      onErrorRef.current?.(`The sandbox did not start within ${timeout} ms.`);
    }, timeout);
  };

  // Same origin as the page would give the code the page itself: together,
  // allow-scripts and allow-same-origin let a frame remove its own sandbox.
  const usable = frameOrigin !== null && frameOrigin !== hostOrigin;

  if (failed || (hostOrigin !== null && !usable)) {
    return (
      <p role="alert" className={className} style={errorStyle} data-testid={testId}>
        {labels?.error ?? 'This interactive example could not be shown.'}
      </p>
    );
  }

  // On the server, and until the page's origin is known, hold the space.
  if (hostOrigin === null) {
    return <div className={className} style={{ height: minHeight }} data-testid={testId} />;
  }

  return (
    <iframe
      key={runKey}
      ref={frameRef}
      title={title}
      src={src}
      // allow-same-origin gives the frame the sandbox origin, which is what
      // lets the browser cache the runtime. It is safe only because that
      // origin is never the page's own — see `usable` above.
      sandbox="allow-scripts allow-same-origin"
      referrerPolicy="no-referrer"
      loading="lazy"
      onLoad={onLoad}
      className={className}
      style={{ display: 'block', width: '100%', border: 0, height }}
      data-testid={testId}
    />
  );
};
