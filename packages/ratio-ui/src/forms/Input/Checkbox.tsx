// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { FC, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export const checkboxStyles = {
  container: 'my-2',
  // `accent-(--primary)` is what actually tints a native checkbox — `text-*` never
  // reached it. The box itself follows the theme's `color-scheme`.
  checkbox:
    'align-text-bottom w-5 h-5 accent-(--primary) bg-card border-border-1 focus:ring-(--focus-ring) focus:ring-2',
  label: 'font-bold ml-2 text-(--text)',
  description: 'ml-7 mt-2 text-sm',
};

interface CheckboxComponentProps {
  id: string;
  /** Extra classes for the checkbox, merged on top of the defaults. */
  className?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  /** Extra classes for the wrapper, merged on top of the defaults. */
  containerClassName?: string;
  /** Drop the default classes of the checkbox and its wrapper. */
  unstyled?: boolean;
}

interface SubComponentProps {
  children: ReactNode;
  /** Extra classes, merged on top of the defaults. */
  className?: string;
  /** Drop the default classes and style from scratch with `className`. */
  unstyled?: boolean;
  htmlFor?: string;
}

export interface CheckboxProps
  extends CheckboxComponentProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'children' | 'className'> {
  testId?: string;
  children?: ReactNode;
}

type CheckboxWithSubComponents = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CheckboxProps> & React.RefAttributes<HTMLInputElement>
> & {
  Label: FC<SubComponentProps>;
  Description: FC<SubComponentProps>;
};

export const CheckBoxLabel: FC<SubComponentProps> = ({ children, className, unstyled = false, htmlFor }) => {
  const labelClassName = cn(!unstyled && checkboxStyles.label, className);
  return (
    <label htmlFor={htmlFor} className={labelClassName}>
      {children}
    </label>
  );
};

export const CheckBoxDescription: FC<SubComponentProps> = ({ children, className, unstyled = false }) => {
  const descriptionClassName = cn(!unstyled && checkboxStyles.description, className);
  return <p className={descriptionClassName}>{children}</p>;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const {
    className,
    containerClassName,
    unstyled = false,
    children,
    id,
    disabled,
    defaultChecked,
    testId,
    ...rest
  } = props;

  const checkboxClassName = cn(!unstyled && checkboxStyles.checkbox, className);
  const containerClass = cn(!unstyled && checkboxStyles.container, containerClassName);

  // Add the htmlFor attribute to the label
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement<SubComponentProps>(child) && child.type === CheckBoxLabel) {
      return React.cloneElement(child, { htmlFor: id } as SubComponentProps);
    }
    return child;
  });

  return (
    <div key={id} className={containerClass}>
      <input
        type="checkbox"
        className={checkboxClassName}
        ref={ref}
        id={id}
        disabled={disabled}
        defaultChecked={defaultChecked}
        data-testid={testId}
        {...rest}
      />
      {enhancedChildren}
    </div>
  );
}) as CheckboxWithSubComponents;

Checkbox.displayName = 'Checkbox';
Checkbox.Label = CheckBoxLabel;
Checkbox.Description = CheckBoxDescription;

export { Checkbox };
