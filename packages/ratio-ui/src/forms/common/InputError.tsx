// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';

import type { FieldErrorMap } from '../Input/InputProps';

type ErrorProps = {
  id?: string;
  errors?: FieldErrorMap;
  name: string;
  className?: string;
};

const InputError: React.FC<ErrorProps> = ({ id, errors, name, className = 'text-error-text' }) => {
  const errorMessage = errors?.[name]?.message;

  if (!errorMessage) return null;

  return (
    <p id={id} role="alert" className={className}>
      {errorMessage}
    </p>
  );
};

export { InputError };
