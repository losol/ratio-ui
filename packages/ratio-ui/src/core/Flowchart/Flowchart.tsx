// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// No 'use client' here, on purpose: the chart is markup, and `Patchbay` (a
// client component) draws the lines. The statics live on a plain function
// this module owns, the same shape as `forms/Patchbay/index.tsx`.

import React, { type ReactNode } from 'react';
import { Card } from '../Card';
import { Patchbay, type PatchbayConnection, type PatchbayConnector } from '../../forms/Patchbay';
import { cn } from '../../utils/cn';
import './Flowchart.css';

/** How the lines turn: at right angles (default), or straight from box to box. */
export type FlowchartConnector = Exclude<PatchbayConnector, 'cable'>;

export interface FlowchartProps {
  /**
   * The whole chart in words, for a screen reader: the boxes read in order,
   * the lines do not. "Is the form signed? If yes, filed; if no, returned."
   */
  'aria-label'?: string;
  /** Columns of the grid the boxes sit on. @default 2 */
  columns?: number;
  /** @default 'elbow' */
  connector?: FlowchartConnector;
  className?: string;
  children?: ReactNode;
  testId?: string;
}

export interface FlowchartNodeProps {
  /** Stable identity; what another box's `from` names. */
  id: string;
  /** The box (or boxes) this one follows: a line runs from each to it. */
  from?: string | string[];
  /** Columns the box takes. @default 1 */
  span?: number;
  /** Where the box sits in its columns. @default 'stretch' */
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  children?: ReactNode;
  /** Set by `Flowchart` when a line leaves this box. Not part of the public API. */
  hasOut?: boolean;
}

const isNode = (child: ReactNode): child is React.ReactElement<FlowchartNodeProps> =>
  React.isValidElement(child) &&
  (child.type as { displayName?: string })?.displayName === 'Flowchart.Node';

const listOf = (from: FlowchartNodeProps['from']): string[] =>
  from === undefined ? [] : Array.isArray(from) ? from : [from];

/**
 * Flowchart — boxes on a grid, joined by lines: a question, its answers,
 * where each leads. Each `Flowchart.Node` says which boxes it follows, and
 * the chart draws the lines; the boxes are framed `Card`s, so a theme that
 * frames its cards thick (Tabula) frames the chart the same way.
 *
 * A diagram, not an input: nothing is pressable. Built on `Patchbay` with
 * `elbow` connectors and anchors instead of sockets.
 *
 * @example
 * ```tsx
 * <Flowchart aria-label="Is the form signed? If yes, it is filed; if no, it is returned.">
 *   <Flowchart.Node id="q" span={2}>Is the form signed?</Flowchart.Node>
 *   <Flowchart.Node id="yes" from="q">Yes</Flowchart.Node>
 *   <Flowchart.Node id="no" from="q">No</Flowchart.Node>
 *   <Flowchart.Node id="filed" from="yes" span={2} align="center">Filed</Flowchart.Node>
 * </Flowchart>
 * ```
 */
function FlowchartRoot({
  'aria-label': ariaLabel,
  columns = 2,
  connector = 'elbow',
  className,
  children,
  testId,
}: Readonly<FlowchartProps>) {
  const kids = React.Children.toArray(children);
  const edges: PatchbayConnection[] = kids.flatMap((child) =>
    isNode(child)
      ? listOf(child.props.from).map((from) => ({ from: `${from}.out`, to: `${child.props.id}.in` }))
      : [],
  );
  const outs = new Set(edges.map((e) => e.from));
  const content = kids.map((child) =>
    isNode(child) ? React.cloneElement(child, { hasOut: outs.has(`${child.props.id}.out`) }) : child,
  );

  return (
    <div
      className={cn('flowchart', className)}
      style={{ '--flowchart-columns': columns } as React.CSSProperties}
      data-testid={testId}
    >
      <Patchbay readOnly connector={connector} connections={edges} aria-label={ariaLabel} className="flowchart-grid">
        {content}
      </Patchbay>
    </div>
  );
}
FlowchartRoot.displayName = 'Flowchart';

/**
 * A box of the chart. `from` names the box (or boxes) it follows; the chart
 * runs a line from each. `span` and `align` place it on the grid.
 */
function FlowchartNode({ id, from, span = 1, align = 'stretch', className, children, hasOut = false }: Readonly<FlowchartNodeProps>) {
  const ins = listOf(from);
  return (
    <Card
      featured
      padding="sm"
      gap="none"
      className={cn('flowchart-node', className)}
      style={{ gridColumn: span > 1 ? `span ${span}` : undefined, justifySelf: align }}
    >
      {ins.length > 0 && (
        <Patchbay.Port anchor id={`${id}.in`} direction="in" name={id} className="flowchart-anchor flowchart-anchor--in" />
      )}
      {children}
      {hasOut && (
        <Patchbay.Port anchor id={`${id}.out`} direction="out" name={id} className="flowchart-anchor flowchart-anchor--out" />
      )}
    </Card>
  );
}
FlowchartNode.displayName = 'Flowchart.Node';

export const Flowchart = Object.assign(FlowchartRoot, { Node: FlowchartNode });
