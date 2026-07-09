// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Check, ChevronDown, Copy, Download, WrapText } from '../../icons';
import { ActionButton } from '../ActionButton';
import { cn } from '../../utils/cn';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import './CodeBlock.css';

export interface CodeBlockProps {
  /** The code to display. Shown raw, whitespace preserved. Source of truth for copy/download/line count. */
  code: string;
  /** Shown in the language badge. A plain label — does not drive highlighting. */
  language?: string;
  /** Optional filename, shown muted next to the badge. */
  filename?: string;
  /**
   * Optional per-line highlighted content — one node per line — rendered in
   * the code cells instead of the raw line text. The gutter stays outside,
   * so alignment holds when wrapping. Produce these from any highlighter
   * (Shiki `codeToTokens`, Prism/hljs via an AST), highlighter-agnostic.
   * Copy/download still use the raw `code`.
   */
  highlightedLines?: React.ReactNode[];
  showHeader?: boolean;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  showWrap?: boolean;
  showCollapse?: boolean;
  showDownload?: boolean;
  /** Clip long blocks at `maxLines` with a fade + "show more". */
  showMore?: boolean;
  maxLines?: number;
  /** Start with word-wrap on. */
  wrap?: boolean;
  startCollapsed?: boolean;
  className?: string;
}

const MIME_BY_LANGUAGE: Record<string, string> = {
  json: 'application/json',
  xml: 'application/xml',
};

const ICON = { size: 15, strokeWidth: 2 } as const;

/**
 * Frames code / JSON / XML with a language badge, optional filename, and a
 * toolbar (copy, word-wrap toggle, download), plus collapse and "show more".
 * It does **not** highlight or format — pass raw `code` (formatting happens
 * upstream) and, optionally, per-line `highlightedLines` from any highlighter
 * (Shiki/Prism/hljs). Surface uses the `--code-*` tokens and follows the theme.
 *
 * @beta This component is experimental — prop shape may change before release.
 */
export function CodeBlock({
  code,
  language = 'TypeScript',
  filename,
  highlightedLines,
  showHeader = true,
  showLineNumbers = true,
  showCopy = true,
  showWrap = true,
  showCollapse = true,
  showDownload = true,
  showMore = false,
  maxLines = 8,
  wrap = false,
  startCollapsed = false,
  className,
}: CodeBlockProps): React.ReactElement {
  const [collapsed, setCollapsed] = useState(startCollapsed);
  const [wrapped, setWrapped] = useState(wrap);
  const [expanded, setExpanded] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const lines = useMemo(() => code.split(/\r\n|\r|\n/), [code]);
  const lineCount = lines.length;

  const clipped = showMore && !expanded && lineCount > maxLines;
  const visibleCount = clipped ? maxLines : lineCount;

  const download = useCallback(() => {
    const mime = MIME_BY_LANGUAGE[language.toLowerCase()] ?? 'text/plain';
    const blob = new Blob([code], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `code.${language.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke after the click is processed so the download isn't cancelled.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [code, filename, language]);

  // Right-hand toolbar lives outside the collapse toggle so its clicks
  // don't fold the block.
  const actions = showHeader && (
    <div
      className="codeblock__actions"
      onClick={(e) => e.stopPropagation()}
      role="presentation"
    >
      {showWrap && (
        <ActionButton
          ariaLabel="Toggle word wrap"
          aria-pressed={wrapped}
          className="enabled:active:scale-100"
          onClick={() => setWrapped((w) => !w)}
        >
          <WrapText {...ICON} />
        </ActionButton>
      )}
      {showDownload && (
        <ActionButton
          ariaLabel="Download"
          className="enabled:active:scale-100"
          onClick={download}
        >
          <Download {...ICON} />
        </ActionButton>
      )}
      {showCopy && (
        <ActionButton
          ariaLabel="Copy code"
          data-copied={copied || undefined}
          className="codeblock__copy enabled:active:scale-100"
          onClick={() => copy(code)}
        >
          {copied ? <Check {...ICON} /> : <Copy {...ICON} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </ActionButton>
      )}
    </div>
  );

  const leading = (
    <>
      {showCollapse && <ChevronDown {...ICON} className="codeblock__chevron" aria-hidden />}
      <span className="codeblock__badge">{language}</span>
      {filename && <span className="codeblock__filename">{filename}</span>}
      {collapsed && <span className="codeblock__count">· {lineCount} lines</span>}
    </>
  );

  return (
    <div
      className={cn(
        'codeblock',
        wrapped && 'codeblock--wrap',
        collapsed && 'codeblock--collapsed',
        !showLineNumbers && 'codeblock--no-ln',
        className
      )}
    >
      {showHeader && (
        <div className="codeblock__header">
          {showCollapse ? (
            <button
              type="button"
              className="codeblock__toggle"
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            >
              {leading}
            </button>
          ) : (
            <div className="codeblock__toggle codeblock__toggle--static">{leading}</div>
          )}
          {actions}
        </div>
      )}

      {!collapsed && (
        <div className="codeblock__body">
          <pre className="codeblock__pre">
            {lines.slice(0, visibleCount).map((line, i) => (
              <div className="codeblock__line" key={i}>
                {showLineNumbers && (
                  <span className="codeblock__ln" aria-hidden="true">
                    {i + 1}
                  </span>
                )}
                <span className="codeblock__cell">{highlightedLines?.[i] ?? line}</span>
              </div>
            ))}
          </pre>
          {clipped && <div className="codeblock__fade" aria-hidden="true" />}
        </div>
      )}

      {!collapsed && clipped && (
        <button type="button" className="codeblock__more" onClick={() => setExpanded(true)}>
          Show {lineCount - maxLines} more lines
        </button>
      )}
    </div>
  );
}

CodeBlock.displayName = 'CodeBlock';
