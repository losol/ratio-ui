// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface FieldsetProps {
  label?: string;
  /** Extra classes for the fieldset, merged on top of the defaults. */
  className?: string;
  /** Extra classes for the legend, merged on top of the defaults. */
  legendClassName?: string;
  /** Drop the default classes of both fieldset and legend. */
  unstyled?: boolean;
  children: ReactNode;
  disabled?: boolean;
}

export const styles = {
  fieldsetClassName: 'text-lg pt-3 pb-6',
  legendClassName: 'text-lg border-b-2 pt-4 pb-2',
};

export const Fieldset: React.FC<FieldsetProps> = props => (
  <fieldset disabled={props.disabled} className={cn(!props.unstyled && styles.fieldsetClassName, props.className)}>
    {props.label && (
      <legend className={cn(!props.unstyled && styles.legendClassName, props.legendClassName)}>{props.label}</legend>
    )}
    {props.children}
  </fieldset>
);
