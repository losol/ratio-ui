// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import './Divider.css';

export interface DividerProps {
  className?: string;
}

/**
 * A thematic break — a horizontal rule drawn with the border token so it
 * reads correctly in every theme.
 */
export const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return <hr className={`divider${className ? ` ${className}` : ''}`} />;
};
