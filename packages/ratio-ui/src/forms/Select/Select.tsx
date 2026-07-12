// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React from 'react';
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components';
import { Check, ChevronDown } from '../../icons';
import { cn } from '../../utils/cn';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  /** Disable just this option. */
  disabled?: boolean;
}

export interface SelectProps {
  /** The options, in display order. */
  options: SelectOption[];
  /** Visible label above the trigger. */
  label?: string;
  /** Text shown while nothing is selected. */
  placeholder?: string;
  /** Size — same `sm | md | lg` scale as Button. @default 'md' */
  size?: SelectSize;

  // — React Aria selection model —
  /** Controlled selected value (`null` clears it). */
  selectedKey?: string | null;
  /** Uncontrolled initial value. */
  defaultSelectedKey?: string;
  /** Fires with the newly selected value, or `null` when the selection is cleared. */
  onSelectionChange?: (value: string | null) => void;
  /** Disable the whole control. */
  isDisabled?: boolean;
  /** Mark the field required. */
  isRequired?: boolean;
  /** Mark the field invalid (red border + `aria-invalid`). */
  isInvalid?: boolean;
  /** Name for native form submission (renders a hidden `<select>`). */
  name?: string;

  onBlur?: (e: React.FocusEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;

  // — Deprecated (pre-refresh) props, kept working for a smooth migration —
  /**
   * @deprecated Use `selectedKey`. (The previous `value` was wired to a DOM
   * attribute, not React Aria's selection — so controlled use never worked;
   * this now maps correctly.)
   */
  value?: string;
  /** @deprecated Use `defaultSelectedKey`. */
  defaultValue?: string;
  /** @deprecated Use `isDisabled`. */
  disabled?: boolean;
  /** @deprecated Use `isRequired`. */
  required?: boolean;

  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  testId?: string;
}

/** Per-size trigger / icon / option metrics. */
const SIZE: Record<SelectSize, { trigger: string; icon: string; item: string }> = {
  sm: { trigger: 'px-2 py-1 text-xs rounded-md', icon: 'h-3.5 w-3.5', item: 'px-2 py-1 text-xs rounded' },
  md: { trigger: 'px-2.5 py-1.5 text-sm rounded-lg', icon: 'h-4 w-4', item: 'px-2 py-1.5 text-sm rounded-md' },
  lg: { trigger: 'px-3 py-2 text-base rounded-lg', icon: 'h-5 w-5', item: 'px-2.5 py-2 text-base rounded-md' },
};

const styles = {
  wrapper: 'flex flex-col gap-1 w-full',
  label: 'text-sm font-medium text-(--text) cursor-default',
  trigger:
    'w-full flex items-center justify-between gap-2 bg-card border text-(--text) transition-colors ' +
    'hover:border-(--primary) ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) ' +
    'disabled:opacity-70 disabled:cursor-not-allowed',
  value: 'flex-1 truncate text-left text-(--text)',
  // Muted (not subtle): a subtle placeholder dimmed further by the disabled
  // opacity was nearly invisible on dark surfaces. Still reads as a hint —
  // muted + italic, below the selected value's `--text`.
  placeholder: 'text-(--text-muted) italic',
  popover:
    'w-[--trigger-width] mt-1 rounded-lg bg-card border border-border-1 shadow-lg overflow-hidden',
  listBox: 'max-h-60 overflow-auto p-1',
  itemBase:
    'flex items-center justify-between gap-2 cursor-pointer select-none text-(--text) outline-none transition-colors',
};

/**
 * Select — an accessible dropdown built on React Aria's `Select`, with a
 * token-driven, `sm | md | lg` skin. Single selection, controlled or
 * uncontrolled, mirroring RAC's selection API.
 *
 * @example
 * <Select
 *   label="Discipline"
 *   options={[
 *     { value: 'logic', label: 'Logic' },
 *     { value: 'ethics', label: 'Ethics' },
 *   ]}
 *   defaultSelectedKey="logic"
 *   onSelectionChange={(value) => setField(value)}
 * />
 */
export const Select: React.FC<SelectProps> = ({
  options,
  label,
  placeholder = 'Select…',
  size = 'md',
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  isDisabled,
  isRequired,
  isInvalid,
  name,
  onBlur,
  onFocus,
  onFocusChange,
  value,
  defaultValue,
  disabled,
  required,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  testId,
}) => {
  // Selection precedence: the new controlled `selectedKey` wins, then the
  // deprecated `value`; otherwise run uncontrolled from `defaultSelectedKey`
  // (falling back to the deprecated `defaultValue`).
  const controlledKey = selectedKey !== undefined ? selectedKey : value;
  const selectionProps =
    controlledKey !== undefined
      ? { selectedKey: controlledKey }
      : { defaultSelectedKey: defaultSelectedKey ?? defaultValue };

  return (
    <AriaSelect
      className={className || styles.wrapper}
      {...selectionProps}
      // Correct React Aria hook — the previous code passed `onChange`, which is
      // a DOM event on the wrapper and never fires for a Select.
      // Mirror `selectedKey`'s nullability: forward a cleared selection as
      // `null`, never the literal string `'null'`.
      onSelectionChange={(key) => onSelectionChange?.(key == null ? null : String(key))}
      onBlur={onBlur}
      onFocus={onFocus}
      onFocusChange={onFocusChange}
      isDisabled={isDisabled ?? disabled}
      isRequired={isRequired ?? required}
      isInvalid={isInvalid}
      name={name}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {label && <Label className={styles.label}>{label}</Label>}
      <Button
        data-testid={testId}
        className={cn(
          styles.trigger,
          SIZE[size].trigger,
          isInvalid
            ? 'border-(--error-solid) hover:border-(--error-solid)'
            : 'border-border-1',
        )}
      >
        <SelectValue className={styles.value}>
          {({ selectedText }) => (
            <span className={selectedText ? '' : styles.placeholder}>
              {selectedText || placeholder}
            </span>
          )}
        </SelectValue>
        <ChevronDown className={cn(SIZE[size].icon, 'shrink-0 text-(--text-subtle)')} aria-hidden="true" />
      </Button>
      <Popover className={styles.popover}>
        <ListBox className={styles.listBox}>
          {options.map((option) => (
            <ListBoxItem
              key={option.value}
              id={option.value}
              textValue={option.label}
              isDisabled={option.disabled}
              className={({ isFocused, isDisabled: itemDisabled }) =>
                cn(
                  styles.itemBase,
                  SIZE[size].item,
                  !itemDisabled && 'hover:bg-card-hover',
                  isFocused && 'bg-card-hover',
                  // Muted colour rather than opacity — a 50%-dimmed row was too
                  // faint on dark surfaces. Still clearly non-interactive.
                  itemDisabled && 'text-(--text-muted) cursor-not-allowed',
                )
              }
            >
              {({ isSelected }) => (
                <>
                  <span className={cn('truncate', isSelected && 'font-medium')}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check
                      className={cn(SIZE[size].icon, 'shrink-0 text-(--primary)')}
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
};
