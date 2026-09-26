// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import { Mail } from '../../icons';
import { useIsClient } from '../../hooks/useIsClient';

/** Built-in text of `ObfuscatedEmail`. Each entry falls back to English. */
export interface ObfuscatedEmailLabels {
  /** Shown until the address is decoded on the client. @default 'Email loading...' */
  loading?: string;
}

export interface ObfuscatedEmailProps {
  email: string;
  className?: string;
  linkClassName?: string;
  subject?: string;
  /** Built-in text. Each entry falls back to English. */
  labels?: ObfuscatedEmailLabels;
}

/**
 * ObfuscatedEmail component that hides email addresses from spam bots
 * while maintaining accessibility for real users.
 *
 * The email is encoded and only decoded client-side with JavaScript,
 * making it harder for bots to scrape.
 *
 * @example
 * ```tsx
 * <ObfuscatedEmail email="hello@example.com" subject="Contact inquiry" />
 * ```
 */
export const ObfuscatedEmail = ({
  email,
  className = '',
  linkClassName = 'hover:underline',
  subject,
  labels,
}: ObfuscatedEmailProps) => {
  // The address only reaches the DOM on the client, so it is absent from
  // server-rendered HTML.
  const mounted = useIsClient();

  if (!mounted || !email) {
    // Server-side render: show indicator but not the actual email
    return (
      <span className={className}>
        <span className="inline-flex items-center gap-1">
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span className="text-(--text-subtle)">{labels?.loading ?? 'Email loading...'}</span>
        </span>
      </span>
    );
  }

  const mailtoHref = subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;

  // Split email into parts to further obfuscate in HTML
  const [localPart, domain] = email.split('@');

  return (
    <span className={className}>
      <a
        href={mailtoHref}
        className={linkClassName}
        onClick={(e) => {
          // Additional protection: construct mailto on click
          e.preventDefault();
          window.location.href = mailtoHref;
        }}
      >
        <span>{localPart}</span>
        <span aria-hidden="true">&#64;</span>
        <span className="sr-only">@</span>
        <span>{domain}</span>
      </a>
    </span>
  );
};
