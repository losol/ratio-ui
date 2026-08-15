// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import type { Status } from '../../tokens/colors';
import { cn } from '../../utils/cn';

const dotStatusClasses: Record<Status, string> = {
  neutral: 'bg-border-2',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

const ringStatusClasses: Record<Status, string> = {
  neutral: 'border-border-2',
  info: 'border-info',
  success: 'border-success',
  warning: 'border-warning',
  error: 'border-error',
};

export type TimelineMarker = 'dot' | 'ring';

export type TimelineItemLayout = 'stacked' | 'inline';

export interface TimelineProps {
  children: React.ReactNode;
  className?: string;
  testId?: string;
}

export interface TimelineItemProps {
  children?: React.ReactNode;
  className?: string;
  /** Timestamp — callers format it. Optional: group headers often need none. */
  timestamp?: React.ReactNode;
  /** Main line describing the event. */
  title: React.ReactNode;
  /** Optional "who did it" — rendered inline next to the timestamp. */
  actor?: React.ReactNode;
  /** Marker color — defaults to neutral. */
  status?: Status;
  /**
   * Header order.
   * - `'stacked'` (default) — timestamp · actor above the title. Audit-log voice.
   * - `'inline'` — title first, timestamp and actor trailing as muted meta.
   *   Release-notes voice; the wider gap replaces the `·`.
   */
  layout?: TimelineItemLayout;
  /**
   * Marker shape. `'dot'` (default) is filled; `'ring'` is hollow — for items
   * that mark a point rather than report an outcome. Ignored when `icon` is set.
   */
  marker?: TimelineMarker;
  /**
   * Optional custom dot content. Replaces the marker entirely. Useful for
   * small icons (e.g. Lucide) sized at h-3 w-3.
   */
  icon?: React.ReactNode;
  testId?: string;
}

const Root: React.FC<TimelineProps> = ({ children, className, testId }) => (
  <ol className={cn('relative m-0 list-none p-0', className)} data-testid={testId}>
    {children}
  </ol>
);

const Item: React.FC<TimelineItemProps> = ({
  children,
  className,
  timestamp,
  title,
  actor,
  status = 'neutral',
  layout = 'stacked',
  marker = 'dot',
  icon,
  testId,
}) => {
  const isInline = layout === 'inline';
  const hasMeta = timestamp != null || actor != null;

  return (
    <li
      className={cn(
        'relative border-l-2 border-border-1 pb-6 pl-6 last:border-transparent last:pb-0',
        className,
      )}
      data-testid={testId}
    >
      <span
        className={cn(
          'absolute left-0 top-1 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-surface',
          !icon &&
            (marker === 'ring'
              ? cn('border-2 bg-surface', ringStatusClasses[status])
              : dotStatusClasses[status]),
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      {isInline ? (
        <div className="flex flex-wrap items-baseline gap-x-3">
          {/* Block wrapper, like the stacked layout — titles may be headings. */}
          <div className="text-sm font-medium text-(--text)">{title}</div>
          {timestamp != null && <time className="text-xs text-(--text-muted)">{timestamp}</time>}
          {actor != null && <span className="text-xs text-(--text-muted)">{actor}</span>}
        </div>
      ) : (
        <>
          {hasMeta && (
            <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-(--text-muted)">
              {timestamp != null && <time>{timestamp}</time>}
              {actor != null && <span>{timestamp != null ? '· ' : null}{actor}</span>}
            </div>
          )}
          <div className={cn('text-sm font-medium text-(--text)', hasMeta && 'mt-0.5')}>
            {title}
          </div>
        </>
      )}
      {children && <div className="mt-2 text-sm text-(--text-muted)">{children}</div>}
    </li>
  );
};

/**
 * Vertical timeline for chronological event lists (audit logs, order history,
 * registration activity, business events).
 *
 * @beta This component is experimental. The prop shape and visual design may
 * change before release.
 *
 * @example
 * <Timeline>
 *   <Timeline.Item timestamp="2026-04-19 10:22" title="Order created" status="success" />
 *   <Timeline.Item timestamp="2026-04-19 10:25" title="Payment method updated" actor="Ada">
 *     <pre>{JSON.stringify(metadata, null, 2)}</pre>
 *   </Timeline.Item>
 * </Timeline>
 *
 * @example
 * // Release-notes voice — version leads, hollow marker, cards as children.
 * <Timeline>
 *   <Timeline.Item
 *     layout="inline"
 *     marker="ring"
 *     title={<span className="font-mono">v2.4.0</span>}
 *     timestamp="27 Jul 2026"
 *     actor="3 changes"
 *   >
 *     <Card accent="warning">…</Card>
 *   </Timeline.Item>
 * </Timeline>
 */
export const Timeline = Object.assign(Root, {
  Item,
});
