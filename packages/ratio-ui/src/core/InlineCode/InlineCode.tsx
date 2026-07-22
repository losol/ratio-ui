// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import './InlineCode.css';

export interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Inline code — a `<code>` pill styled with the shared code tokens, so short
 * snippets in running text match `CodeBlock` and stay legible in every theme.
 */
export const InlineCode: React.FC<InlineCodeProps> = ({ children, className = '' }) => {
  return (
    <code className={`inline-code${className ? ` ${className}` : ''}`}>
      {children}
    </code>
  );
};
