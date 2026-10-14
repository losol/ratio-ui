// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { useId, type ReactNode } from 'react';
import { labelClassName } from '../common/Label';
import { cn } from '../../utils/cn';

export interface SettingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The setting's name, over the control. */
  label: ReactNode;
  /** A line under the name: what the setting does, its unit. */
  description?: ReactNode;
  /**
   * The name beside the control instead of over it, the control at the end
   * of the row: a `Switch`, a short `Select`.
   */
  inline?: boolean;
  /**
   * The control. A single element that does not name itself (no `label`,
   * `aria-label` or `aria-labelledby`) is named by the setting, and
   * described by its description. Several children, or one that names
   * itself, are left as they are: the setting is then a caption.
   */
  children: ReactNode;
  className?: string;
}

const namesItself = (props: Record<string, unknown>) =>
  props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined || props.label !== undefined;

/**
 * Setting — a setting's name over its control, for the controls that are
 * not form fields: a `Counter` for the tempo, a `ToggleButtonGroup` for the
 * meter, a `Select` for the scale, a row of `Knob`s. The name is set like a
 * field's label (`--label-*` tokens), so a page of settings reads like a
 * form, and it names the control for a screen reader: with one unnamed
 * child, `aria-labelledby` points at the name and `aria-describedby` at the
 * description, so the control needs no `aria-label` of its own.
 *
 * @example
 * ```tsx
 * <Setting label="Tempo" description="Beats per minute">
 *   <Counter value={bpm} onChange={setBpm} minValue={40} maxValue={240} />
 * </Setting>
 * ```
 */
export function Setting({ label, description, inline = false, children, className, ...rest }: SettingProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;

  const kids = React.Children.toArray(children);
  const only = kids.length === 1 ? kids[0] : undefined;
  const content =
    React.isValidElement<Record<string, unknown>>(only) && !namesItself(only.props)
      ? React.cloneElement(only, {
          'aria-labelledby': labelId,
          ...(descriptionId && only.props['aria-describedby'] === undefined
            ? { 'aria-describedby': descriptionId }
            : {}),
        })
      : children;

  const name = (
    <span id={labelId} className={cn(labelClassName, inline && 'mb-0')}>
      {label}
    </span>
  );
  const note = description && (
    <p id={descriptionId} className={cn('m-0 text-sm text-(--text-muted)', !inline && 'mb-2')}>
      {description}
    </p>
  );

  if (inline) {
    return (
      <div className={cn('flex items-center justify-between gap-4', className)} {...rest}>
        <div className="min-w-0">
          {name}
          {note}
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-start', className)} {...rest}>
      {name}
      {note}
      {content}
    </div>
  );
}
Setting.displayName = 'Setting';
