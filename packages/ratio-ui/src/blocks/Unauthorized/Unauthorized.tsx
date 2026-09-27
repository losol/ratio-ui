// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { ShieldX } from '../../icons';

/** Built-in text of `Unauthorized`. Each entry falls back to English. */
export interface UnauthorizedLabels {
  /** @default 'Unauthorized' */
  title?: string;
  /** @default 'Uh-oh! It looks like you do not have the right permissions to view this content.' */
  message?: string;
  /** Shown in the large variant. @default 'If you believe this is an error, please contact support.' */
  contactSupport?: string;
}

export type UnauthorizedProps = {
  /** @deprecated Never rendered; will be removed in the next major. */
  homeUrl?: string;
  variant?: 'small' | 'large';
  labels?: UnauthorizedLabels;
};

export function Unauthorized({ variant = 'large', labels }: Readonly<UnauthorizedProps>) {
  const isSmall = variant === 'small';
  const {
    title = 'Unauthorized',
    message = 'Uh-oh! It looks like you do not have the right permissions to view this content.',
    contactSupport = 'If you believe this is an error, please contact support.',
  } = labels ?? {};

  return (
    <div
      className={`flex flex-col items-center px-6 text-center ${isSmall ? 'py-8' : 'py-20'} bg-error text-error-on`}
    >
      <ShieldX aria-hidden className={isSmall ? 'h-6 w-6' : 'h-8 w-8'} />
      <h1 className={`${isSmall ? 'text-2xl' : 'text-4xl'} m-0 mt-3 font-extrabold`}>{title}</h1>
      <p className={`${isSmall ? 'text-base' : 'text-lg'} m-0 mt-2 max-w-prose text-balance`}>
        {message}
      </p>
      {!isSmall && <p className="m-0 mt-6 max-w-prose text-base text-balance">{contactSupport}</p>}
    </div>
  );
}
