// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { useEffect, useState } from 'react';
import {
  SearchField as AriaSearchField,
  Input,
} from 'react-aria-components';
import { ActionButton } from '../../core/ActionButton';
import { Search, X } from '../../icons';
import { cn } from '../../utils/cn';

export type SearchFieldSize = 'sm' | 'md' | 'lg';

export interface SearchFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Fires on Enter. Mirrors React Aria. */
  onSubmit?: (value: string) => void;
  /** Fires when the field is cleared (clear button or Escape). Mirrors React Aria. */
  onClear?: () => void;
  placeholder?: string;
  /**
   * Size — same `sm | md | lg` scale as Button. `sm` is the compact variant
   * for sidebars and toolbars. @default 'md'
   */
  size?: SearchFieldSize;
  /** Name for native form submission. Mirrors React Aria. */
  name?: string;
  autoFocus?: boolean;
  'aria-label'?: string;
  className?: string;
  isDisabled?: boolean;
  /** Debounce delay in milliseconds for `onChange`. Default: 300ms */
  debounce?: number;
  testId?: string;
}

/** Per-size input metrics + icon/clear placement. */
const SIZES: Record<
  SearchFieldSize,
  { input: string; icon: string; iconWrap: string; clearWrap: string }
> = {
  sm: {
    input:
      'w-full appearance-none rounded-lg border border-border-1 bg-card text-(--text) ' +
      'py-1.5 pl-8 pr-8 text-[13px] leading-tight ' +
      'focus:outline-hidden focus:ring-2 focus:ring-(--focus-ring)',
    icon: 'h-3.5 w-3.5',
    iconWrap: 'left-2.5',
    clearWrap: 'right-1.5',
  },
  // md/lg match Button's heights (~38px / ~50px) rather than the chunky
  // p-4/border-2 form default, so a SearchField sits level with buttons in
  // the same row.
  md: {
    input:
      'w-full appearance-none rounded-lg border border-border-1 bg-card text-(--text) ' +
      'py-2 pl-10 pr-10 text-sm leading-tight ' +
      'focus:outline-hidden focus:ring-2 focus:ring-(--focus-ring)',
    icon: 'h-4.5 w-4.5',
    iconWrap: 'left-3',
    clearWrap: 'right-2',
  },
  lg: {
    input:
      'w-full appearance-none rounded-lg border border-border-1 bg-card text-(--text) ' +
      'py-3 pl-11 pr-12 text-base leading-tight ' +
      'focus:outline-hidden focus:ring-2 focus:ring-(--focus-ring)',
    icon: 'h-5 w-5',
    iconWrap: 'left-3.5',
    clearWrap: 'right-2.5',
  },
};

/**
 * SearchField — a search input with magnifier, clear button, and proper
 * semantics, built on React Aria's SearchField. The clear button appears
 * when the field has content (it's an `ActionButton`, wired up by React
 * Aria's context — Escape clears too), and `onChange` is debounced
 * (300ms default).
 *
 * @example
 * <SearchField
 *   size="sm"
 *   value={query}
 *   onChange={setQuery}
 *   placeholder="Filter types…"
 *   aria-label="Filter resource types"
 * />
 */
export const SearchField = React.forwardRef<HTMLDivElement, SearchFieldProps>(
  (
    {
      value: externalValue = '',
      onChange,
      onSubmit,
      onClear,
      placeholder = 'Search...',
      size = 'md',
      name,
      autoFocus,
      'aria-label': ariaLabel,
      className,
      isDisabled,
      debounce = 300,
      testId,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(externalValue);
    const s = SIZES[size];

    // Sync external value to internal
    useEffect(() => {
      setInternalValue(externalValue);
    }, [externalValue]);

    // Debounced onChange
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (onChange && internalValue !== externalValue) {
          onChange(internalValue);
        }
      }, debounce);

      return () => clearTimeout(timeout);
    }, [internalValue, externalValue, onChange, debounce]);

    return (
      <AriaSearchField
        value={internalValue}
        onChange={setInternalValue}
        onSubmit={onSubmit}
        onClear={onClear}
        isDisabled={isDisabled}
        name={name}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        // `group` exposes React Aria's data-empty to the clear button below.
        className={cn('group', className)}
        data-testid={testId}
        ref={ref}
      >
        <div className="relative">
          <div
            className={cn(
              'pointer-events-none absolute top-1/2 -translate-y-1/2 text-(--text-subtle)',
              s.iconWrap,
            )}
          >
            <Search className={s.icon} />
          </div>
          <Input placeholder={placeholder} className={s.input} />
          {/* React Aria wires this button to clear the field (ButtonContext).
              Hidden while the field is empty. */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 group-data-empty:hidden',
              s.clearWrap,
            )}
          >
            <ActionButton
              round
              size="sm"
              variant="ghost"
              ariaLabel="Clear search"
              className="border-0 text-(--text-muted)"
            >
              <X className="h-3.5 w-3.5" />
            </ActionButton>
          </div>
        </div>
      </AriaSearchField>
    );
  }
);

SearchField.displayName = 'SearchField';
