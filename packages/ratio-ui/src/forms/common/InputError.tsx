// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React from 'react';

type ErrorProps = {
  errors?: { [key: string]: { message: string } | undefined };
  name: string;
  className?: string;
};

const InputError: React.FC<ErrorProps> = ({ errors, name, className = 'text-red-500' }) => {
  const errorMessage = errors?.[name]?.message;

  if (!errorMessage) return null;

  return (
    <label htmlFor={name} role="alert" className={className}>
      {errorMessage}
    </label>
  );
};

export { InputError };
