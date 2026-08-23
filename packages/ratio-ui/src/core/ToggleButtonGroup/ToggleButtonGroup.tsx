// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React from 'react';
import { ToggleButtonGroup as AriaToggleButtonGroup, type Key } from 'react-aria-components';
import { ToggleButton } from '../ToggleButton';
import { cn } from '../../utils/cn';

export type ToggleButtonGroupSize = 'sm' | 'md' | 'lg';
export type ToggleButtonGroupVariant = 'segmented' | 'chips';

export interface ToggleButtonOption {
  /** Stable identity of the segment; the key reported in the selection. */
  value: string;
  /** Visible content of the segment. */
  label: React.ReactNode;
  /** Optional count badge rendered after the label. */
  count?: number;
  /** Native tooltip / longer description. */
  title?: string;
  /** Disable just this segment. */
  isDisabled?: boolean;
}

export interface ToggleButtonGroupProps {
  /** The segments, in display order. */
  options: ToggleButtonOption[];
  /**
   * `'segmented'` (default) sits the options in one recessed pill track —
   * a few mutually exclusive views of the same thing, always visible
   * together. `'chips'` drops the track and lets each option stand as its
   * own outlined pill, wrapping onto further lines: the filter-chip row,
   * where the set can be long and any number may be on at once.
   * @default 'segmented'
   */
  variant?: ToggleButtonGroupVariant;
  /** Segment size — same `sm | md | lg` scale as Button. @default 'md' */
  size?: ToggleButtonGroupSize;
  /** Stretch to fill the container; segments then share the width equally. Segmented only. */
  fullWidth?: boolean;

  // — React Aria selection model —
  /**
   * Whether one segment or several can be active at once. Mirrors React Aria.
   * @default 'single'
   */
  selectionMode?: 'single' | 'multiple';
  /** Controlled selection (the set of active `value`s). */
  selectedKeys?: Iterable<Key>;
  /** Uncontrolled initial selection. */
  defaultSelectedKeys?: Iterable<Key>;
  /** Fires with the full set of active keys (empty when the last is cleared). */
  onSelectionChange?: (keys: Set<Key>) => void;
  /**
   * Forbid clearing the last active segment — radio-style "exactly one".
   * Off by default, so segments can toggle fully off. Mirrors React Aria.
   * @default false
   */
  disallowEmptySelection?: boolean;
  /** Disable the whole control. */
  isDisabled?: boolean;

  // — Deprecated scalar API (pre-v2), kept working for a smooth migration —
  /**
   * @deprecated Use `selectedKeys` (single-mode). Still honored for now;
   * removed in a future major.
   */
  value?: string | null;
  /**
   * @deprecated Use `onSelectionChange`. Still fires for now; removed in a
   * future major.
   */
  onChange?: (value: string | null) => void;

  /** Accessible label for the group (use when there's no visible label). */
  'aria-label'?: string;
  className?: string;
  testId?: string;
}

/**
 * ToggleButtonGroup — a pill-shaped row of options with a filled active segment
 * (iOS-style). A thin, token-driven skin over React Aria's `ToggleButtonGroup`,
 * so it inherits keyboard navigation, focus management, and RAC's selection
 * model verbatim: single or multiple selection, controlled or uncontrolled,
 * with an optional empty selection.
 *
 * Chrome is token-driven via `--primary` / `--text-*` / `--border-1`, so themes
 * reskin it without touching the component.
 *
 * @example
 * // Single-select view switcher (uncontrolled)
 * <ToggleButtonGroup
 *   aria-label="View"
 *   options={[
 *     { value: 'grid', label: 'Grid' },
 *     { value: 'list', label: 'List' },
 *   ]}
 *   defaultSelectedKeys={['grid']}
 *   onSelectionChange={(keys) => setView([...keys][0])}
 * />
 *
 * @example
 * // Multi-select filter with counts
 * <ToggleButtonGroup
 *   selectionMode="multiple"
 *   options={[
 *     { value: 'open', label: 'Open', count: 12 },
 *     { value: 'closed', label: 'Closed', count: 4 },
 *   ]}
 * />
 */
export function ToggleButtonGroup({
  variant = 'segmented',
  options,
  size = 'md',
  fullWidth = false,
  selectionMode = 'single',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disallowEmptySelection,
  isDisabled,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
  testId,
}: Readonly<ToggleButtonGroupProps>) {
  // Selection precedence: the new controlled `selectedKeys` wins, then the
  // deprecated scalar `value`, then the uncontrolled `defaultSelectedKeys`
  // (undefined → RAC runs uncontrolled, starting empty).
  const controlledKeys =
    selectedKeys !== undefined
      ? selectedKeys
      : value !== undefined
        ? value == null
          ? []
          : [value]
        : undefined;

  const selectionProps =
    controlledKeys !== undefined
      ? { selectedKeys: controlledKeys }
      : { defaultSelectedKeys };

  const handleSelectionChange = (keys: Set<Key>) => {
    onSelectionChange?.(keys);
    // Bridge the deprecated scalar callback — but only in single mode, the
    // only shape it can represent. In multiple mode a lone value would
    // misreport the selection, so we don't call it (use `onSelectionChange`).
    if (selectionMode === 'single') {
      onChange?.(keys.size ? String([...keys][0]) : null);
    }
  };

  return (
    <AriaToggleButtonGroup
      selectionMode={selectionMode}
      {...selectionProps}
      onSelectionChange={handleSelectionChange}
      disallowEmptySelection={disallowEmptySelection}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn(
        variant === 'segmented'
          ? // Recessed pill track: a low-opacity tint of the text color reads on
            // both light and dark surfaces without a dedicated token.
            'inline-flex gap-1 p-0.75 rounded-full border border-border-1 bg-[color-mix(in_srgb,var(--text)_7%,transparent)]'
          : // Chips carry their own outline, so the row is just layout — and it
            // wraps, since a filter set has no fixed length.
            'flex flex-wrap items-center gap-2',
        variant === 'segmented' && fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((option) => (
        // The pill chrome lives in ToggleButton's variants, so a lone toggle
        // and one inside a group are the same component.
        <ToggleButton
          key={option.value}
          id={option.value}
          variant={variant === 'chips' ? 'chip' : 'segmented'}
          size={size}
          isDisabled={option.isDisabled}
          // When `label` isn't plain text (e.g. an icon), the button would have
          // no accessible name — fall back to `title` so it isn't announced
          // empty. Text labels name themselves, so leave those undefined.
          aria-label={typeof option.label === 'string' ? undefined : option.title}
          className={variant === 'segmented' && fullWidth ? 'flex-1' : undefined}
        >
          {/* `title` lives on the content span: React Aria's ToggleButton only
              forwards its curated DOM-attribute set, which omits `title`. */}
          <span className="inline-flex items-center gap-1.5" title={option.title}>
            {option.label}
            {option.count !== undefined && (
              // Inherit the segment's text color at full strength (no opacity
              // dim): on an inactive segment the label is already `--text-muted`,
              // so dimming the count below that fails WCAG AA. Smaller size +
              // parens keep it visually secondary.
              <span className="text-xs font-medium">({option.count})</span>
            )}
          </span>
        </ToggleButton>
      ))}
    </AriaToggleButtonGroup>
  );
}
