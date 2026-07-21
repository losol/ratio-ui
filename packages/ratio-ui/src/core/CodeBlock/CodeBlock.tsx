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

/** A note attached to a line — validator output, a review comment, an explanation. */
export interface CodeAnnotation {
  /**
   * 1-based line the note belongs to; it renders directly beneath that line.
   * Ignored when it isn't a positive integer, points past the end of `code`, or
   * falls on a line hidden by `showMore`.
   */
  line: number;
  /** Tone of the note. @default 'info' */
  severity?: 'error' | 'warning' | 'info' | 'success';
  /** The note itself. Nodes, not an HTML string — safe from injection. */
  message: React.ReactNode;
  /** Short machine-readable code shown as a pill, e.g. a validator rule id. */
  code?: string;
  /** Where the note points — a path or expression, shown muted beside the code. */
  path?: string;
}

const SEVERITY_LABEL: Record<NonNullable<CodeAnnotation['severity']>, string> = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  success: 'Success',
};

export interface CodeBlockProps {
  /** The code to display. Shown raw, whitespace preserved. Source of truth for copy/download/line count. */
  code: string;
  /** Shown in the language badge. A plain label — does not drive highlighting. */
  language?: string;
  /** Optional filename, shown muted next to the badge. */
  filename?: string;
  /**
   * Interactive language picker rendered in the header's right-hand toolbar
   * (alongside copy / wrap / download). Plug in a `ToggleButtonGroup` (a few
   * languages) or a `Select` (many) — you own the selection state and swap
   * `code` **and `language`** accordingly (`language` also drives the download
   * filename + MIME type). The static language badge is dropped while it's
   * present (the selector already shows the language). Kept as a slot so
   * `CodeBlock` stays in `core` without depending on `forms`.
   */
  languageSelector?: React.ReactNode;
  /**
   * Optional per-line highlighted content — one node per line — rendered in
   * the code cells instead of the raw line text. The gutter stays outside,
   * so alignment holds when wrapping. Produce these from any highlighter
   * (Shiki `codeToTokens`, Prism/hljs via an AST), highlighter-agnostic.
   * Copy/download still use the raw `code`.
   */
  highlightedLines?: React.ReactNode[];
  /**
   * Notes rendered inline, each directly beneath the line it refers to —
   * validation issues, review comments, explanations. Unlike a tooltip they
   * stay put: long messages wrap, every note is scannable at a glance, and the
   * text lives in the document (so keyboard and screen-reader users reach it,
   * and a screenshot captures it).
   */
  annotations?: CodeAnnotation[];
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

/**
 * Download file extension per language label (lower-cased). Falls back to the
 * label itself when unmapped, so `language="TypeScript"` downloads as `.ts`,
 * not `.typescript`.
 */
const EXTENSION_BY_LANGUAGE: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  json: 'json',
  xml: 'xml',
  python: 'py',
  csharp: 'cs',
  'c#': 'cs',
  html: 'html',
  css: 'css',
  markdown: 'md',
  yaml: 'yml',
  bash: 'sh',
  shell: 'sh',
  sql: 'sql',
  java: 'java',
  go: 'go',
  rust: 'rs',
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
  languageSelector,
  highlightedLines,
  annotations,
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

  // Grouped by line so each row can render its own notes without rescanning.
  // A `line` that isn't a positive integer is dropped here rather than landing
  // in a bucket no row ever looks up — the effect is the same, but the intent
  // is visible instead of looking like an accident.
  const annotationsByLine = useMemo(() => {
    const byLine = new Map<number, CodeAnnotation[]>();
    for (const note of annotations ?? []) {
      if (!Number.isInteger(note.line) || note.line < 1) continue;
      const existing = byLine.get(note.line);
      if (existing) existing.push(note);
      else byLine.set(note.line, [note]);
    }
    return byLine;
  }, [annotations]);

  const download = useCallback(() => {
    const key = language.toLowerCase();
    const mime = MIME_BY_LANGUAGE[key] ?? 'text/plain';
    // Map the label to a real extension (TypeScript → ts); fall back to the
    // label itself for anything unmapped.
    const ext = EXTENSION_BY_LANGUAGE[key] ?? key;
    const blob = new Blob([code], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `code.${ext}`;
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

  // The whole leading row is the collapse target. The static language badge is
  // dropped when a `languageSelector` is provided — the selector (rendered with
  // the toolbar on the right) already shows the language.
  const leading = (
    <>
      {showCollapse && <ChevronDown {...ICON} className="codeblock__chevron" aria-hidden />}
      {!languageSelector && <span className="codeblock__badge">{language}</span>}
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
          {/* The selector sits with the toolbar on the right, whatever form it
              takes. Its own wrapper isolates clicks so they don't toggle
              collapse (like `actions`). */}
          {languageSelector && (
            <div
              className="codeblock__language"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              {languageSelector}
            </div>
          )}
          {actions}
        </div>
      )}

      {!collapsed && (
        <div className="codeblock__body">
          <pre className="codeblock__pre">
            {lines.slice(0, visibleCount).map((line, i) => {
              const notes = annotationsByLine.get(i + 1);
              return (
                <React.Fragment key={i}>
                  <div className="codeblock__line">
                    {showLineNumbers && (
                      <span className="codeblock__ln" aria-hidden="true">
                        {i + 1}
                      </span>
                    )}
                    <span className="codeblock__cell">{highlightedLines?.[i] ?? line}</span>
                  </div>
                  {notes?.map((note, n) => {
                    const severity = note.severity ?? 'info';
                    return (
                      <div
                        key={n}
                        className={cn('codeblock__annotation', `codeblock__annotation--${severity}`)}
                      >
                        <div className="codeblock__annotation-meta">
                          <span className="codeblock__annotation-severity">
                            {SEVERITY_LABEL[severity]}
                          </span>
                          {note.code && (
                            <span className="codeblock__annotation-code">{note.code}</span>
                          )}
                          {note.path && (
                            <span className="codeblock__annotation-path">{note.path}</span>
                          )}
                        </div>
                        <div className="codeblock__annotation-message">{note.message}</div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
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
