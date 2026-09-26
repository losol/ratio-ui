// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Sun, Moon } from '../../icons';

export interface ThemeToggleProps {
  /** Current theme value */
  theme?: 'light' | 'dark' | null;
  /** Callback when theme changes */
  onThemeChange: (theme: 'light' | 'dark') => void;
  /** Optional className for custom styling */
  className?: string;
  /**
   * Accessible name of the toggle. Defaults to what pressing it does
   * (`labels.switchToLight` / `labels.switchToDark`), or 'Toggle theme' before
   * the theme is known on the client.
   */
  'aria-label'?: string;
  /** @deprecated Use the native `aria-label`. Still honoured until the next major. */
  ariaLabel?: string;
  /** Built-in text. Each entry falls back to English. */
  labels?: ThemeToggleLabels;
}

/** Built-in text of `ThemeToggle`. Each entry falls back to English. */
export interface ThemeToggleLabels {
  /** @default 'Switch to light mode' */
  switchToLight?: string;
  /** @default 'Switch to dark mode' */
  switchToDark?: string;
}

/**
 * ThemeToggle component for switching between light and dark modes
 *
 * @example
 * ```tsx
 * <ThemeToggle
 *   theme={currentTheme}
 *   onThemeChange={(newTheme) => setTheme(newTheme)}
 * />
 * ```
 */
export const ThemeToggle = ({
  theme,
  onThemeChange,
  className = '',
  'aria-label': ariaLabelAttr,
  ariaLabel,
  labels,
}: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';
  const explicitName = ariaLabelAttr ?? ariaLabel;
  const actionName = isDark
    ? (labels?.switchToLight ?? 'Switch to light mode')
    : (labels?.switchToDark ?? 'Switch to dark mode');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    onThemeChange(isDark ? 'light' : 'dark');
  };

  // Prevent hydration mismatch by not rendering icon until mounted
  if (!mounted) {
    return (
      <Button
        variant="text"
        size="sm"
        onClick={handleToggle}
        className={className}
        aria-label={explicitName ?? 'Toggle theme'}
        type="button"
      >
        <span className="w-5 h-5 block" />
      </Button>
    );
  }

  return (
    <Button
      variant="text"
      size="sm"
      onClick={handleToggle}
      className={className}
      // Named by what pressing it does. One name only: a hidden text beside an
      // aria-label would never be read.
      aria-label={explicitName ?? actionName}
      type="button"
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        {isDark ? (
          <Sun className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Moon className="w-5 h-5" aria-hidden="true" />
        )}
      </span>
    </Button>
  );
};
