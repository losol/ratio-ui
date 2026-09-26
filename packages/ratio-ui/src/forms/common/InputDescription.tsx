// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';
import { cn } from '../../utils/cn';

type LabelProps = {
  children?: React.ReactNode;
  /** Extra classes, merged on top of the defaults. */
  className?: string;
  /** Drop the default classes and style from scratch with `className`. */
  unstyled?: boolean;
};

const styles = {
  description: 'block mb-2',
};

/**
 * Renders a description element with optional custom styling.
 *
 * Designed to be used in conjunction with input elements, it provides an accessible
 * and stylized way to label forms. If no children are provided, the component renders
 * `null` to avoid rendering an empty label element.
 *
 * @param {LabelProps} props - The properties passed to the label component.
 * @returns {React.ReactElement | null} The Label component or null if no children are provided.
 */
const InputDescription: React.FC<LabelProps> = ({ children, className, unstyled = false }) => {
  if (!children) return null;

  return (
    <p className={cn(!unstyled && styles.description, className)}>
      {children}
    </p>
  );
};

export { InputDescription };
