// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface FormProps  {
  action?: any;
  children: ReactNode;
  onSubmit?: (data: any) => void;
  /** Extra classes, merged on top of the defaults. */
  className?: string;
  /** Drop the default classes and style from scratch with `className`. */
  unstyled?: boolean;
  testId?: string;
}

const defaultFormClassName = 'pt-6 pb-8 mb-4';

export const Form: FC<FormProps> = (props) => {

  return (
    <form
        action={props.action}
        onSubmit={props.onSubmit}
        className={cn(!props.unstyled && defaultFormClassName, props.className)}
        data-testid={props.testId}
      >
        {props.children}
      </form>
  );
};
