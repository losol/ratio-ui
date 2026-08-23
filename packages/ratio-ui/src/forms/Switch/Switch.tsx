// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React from 'react';
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from 'react-aria-components';

import { cn } from '../../utils/cn';

export type SwitchSize = 'sm' | 'md' | 'lg';

// `className` is omitted and re-declared as a plain string: the component
// composes it with its own classes. `style` passes through untouched, keeping
// React Aria's render-prop form.
export interface SwitchProps extends Omit<AriaSwitchProps, 'children' | 'className'> {
  /** Visible label. Keep it a statement of what is on, not an instruction. */
  children?: React.ReactNode;
  /** Supporting line under the label — the consequence, when it isn't obvious. */
  description?: React.ReactNode;
  /** Size — same `sm | md | lg` scale as Button. @default 'md' */
  size?: SwitchSize;
  /**
   * `'end'` (default) puts the label after the track — the toolbar form.
   * `'start'` puts it first, for a settings row; pair with
   * `className="w-full justify-between"` to push the track to the edge.
   */
  labelPosition?: 'start' | 'end';
  className?: string;
  testId?: string;
}

// Written out in full: Tailwind scans source text, so a class assembled at
// runtime (`group-data-[selected]:${offset}`) would never be generated.
const sizeConfig = {
  sm: { track: 'h-4 w-7', knob: 'h-3 w-3 group-data-[selected]:translate-x-3' },
  md: { track: 'h-5 w-9', knob: 'h-4 w-4 group-data-[selected]:translate-x-4' },
  lg: { track: 'h-6 w-11', knob: 'h-5 w-5 group-data-[selected]:translate-x-5' },
} as const;

const labelSize = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
} as const;

// The track reads as a container that fills when on: card-toned when off,
// primary when on. `group-data-*` targets the state RAC puts on the label.
const TRACK = [
  'relative inline-flex shrink-0 items-center rounded-full p-0.5',
  'border border-border-2 bg-card transition-colors',
  'group-data-[selected]:border-(--primary) group-data-[selected]:bg-(--primary)',
  'group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-(--focus-ring)',
].join(' ');

const KNOB = [
  'rounded-full bg-(--text-subtle) shadow-sm transition-transform',
  'group-data-[selected]:bg-(--text-on-primary)',
].join(' ');

/**
 * Switch — an on/off control that takes effect immediately: showing detail in
 * a list, turning a notification on. Built on React Aria Components, so the
 * selection API is theirs (`isSelected`, `defaultSelected`, `onChange`,
 * `isDisabled`, `isReadOnly`).
 *
 * Reach for a `Checkbox` instead when the value is submitted with a form, and
 * for a `ToggleButton` when the control belongs in a row of buttons and reads
 * as pressed rather than on.
 *
 * @example
 * ```tsx
 * <Switch isSelected={showDetail} onChange={setShowDetail}>Show detail</Switch>
 * ```
 *
 * @example A settings row — label first, track pushed to the edge:
 * ```tsx
 * <Switch
 *   labelPosition="start"
 *   className="w-full justify-between"
 *   description="Send a digest every Monday"
 * >
 *   Weekly summary
 * </Switch>
 * ```
 */
export function Switch({
  children,
  description,
  size = 'md',
  labelPosition = 'end',
  className,
  testId,
  ...props
}: Readonly<SwitchProps>) {
  const track = (
    <span aria-hidden className={cn(TRACK, sizeConfig[size].track)}>
      <span className={cn(KNOB, sizeConfig[size].knob)} />
    </span>
  );

  const label = (children || description) && (
    <span className="flex min-w-0 flex-col">
      {children && <span className={cn(labelSize[size], 'text-(--text)')}>{children}</span>}
      {description && <span className="text-sm text-(--text-subtle)">{description}</span>}
    </span>
  );

  return (
    <AriaSwitch
      {...props}
      data-testid={testId}
      className={cn(
        'group flex cursor-pointer items-center gap-3 outline-none',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        'data-[readonly]:cursor-default',
        className,
      )}
    >
      {labelPosition === 'start' ? (
        <>
          {label}
          {track}
        </>
      ) : (
        <>
          {track}
          {label}
        </>
      )}
    </AriaSwitch>
  );
}
