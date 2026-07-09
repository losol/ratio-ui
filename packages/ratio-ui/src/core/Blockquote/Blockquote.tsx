// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import './Blockquote.css';

export interface BlockquoteProps {
  children: React.ReactNode;
  className?: string;
  cite?: string;
}

/**
 * Blockquote component with warm, collective styling
 */
export const Blockquote: React.FC<BlockquoteProps> = ({
  children,
  className = '',
  cite
}) => {
  return (
    <blockquote className={className} cite={cite}>
      {children}
    </blockquote>
  );
};
