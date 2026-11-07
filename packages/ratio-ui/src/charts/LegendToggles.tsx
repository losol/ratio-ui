'use client';

// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// The chart's one client part, and as thin as it can be: a row of toggle
// buttons that mark a series' marks in the server-rendered figure as muted.
// It draws nothing and computes nothing; the bars, the line and the
// tooltips are already on the page, each tagged with `data-series`.

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

/** A series as the toggles show it: plain data, so a server part can hand it over. */
export interface LegendToggleItem {
  key: string;
  label: string;
  kind: 'bar' | 'line';
  color: string;
}

export interface LegendTogglesProps {
  items: readonly LegendToggleItem[];
  className?: string;
}

/**
 * Legend entries as toggle buttons. A muted series fades in the plot and in
 * the tooltips rather than vanishing, so the stacks keep their height and
 * the scale holds still; the table keeps every number.
 */
export function LegendToggles({ items, className }: LegendTogglesProps) {
  const ref = useRef<HTMLUListElement>(null);
  const [muted, setMuted] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const figure = ref.current?.closest('.ratio-chart');
    if (!figure) return;
    figure.querySelectorAll<HTMLElement | SVGElement>('[data-series]').forEach((el) => {
      if (el.dataset.series && muted.has(el.dataset.series)) el.setAttribute('data-muted', '');
      else el.removeAttribute('data-muted');
    });
  }, [muted]);

  const toggle = (key: string) =>
    setMuted((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <ul ref={ref} className={cn('ratio-chart__legend', className)} data-interactive="">
      {items.map((s) => (
        <li key={s.key} className="ratio-chart__legend-item">
          <button
            type="button"
            className="ratio-chart__legend-button"
            aria-pressed={!muted.has(s.key)}
            onClick={() => toggle(s.key)}
          >
            <span
              className="ratio-chart__swatch"
              data-kind={s.kind}
              style={{ color: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
