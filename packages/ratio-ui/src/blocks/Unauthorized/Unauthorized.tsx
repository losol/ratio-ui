// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

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
  homeUrl?: string;
  variant?: 'small' | 'large';
  labels?: UnauthorizedLabels;
};

export function Unauthorized({ homeUrl = '/', variant = 'large', labels }: Readonly<UnauthorizedProps>) {
  const isSmall = variant === 'small';
  const {
    title = 'Unauthorized',
    message = 'Uh-oh! It looks like you do not have the right permissions to view this content.',
    contactSupport = 'If you believe this is an error, please contact support.',
  } = labels ?? {};

  return (
    <div className={`text-center ${isSmall ? 'py-8' : 'py-20'} bg-error text-error-on`}>
      <div className="inline-flex items-center justify-center p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${isSmall ? 'h-6 w-6' : 'h-8 w-8'} animate-bounce`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <h1 className={`${isSmall ? 'text-2xl' : 'text-4xl'} font-extrabold ml-2`}>{title}</h1>
      </div>
      <p className={`${isSmall ? 'text-md' : 'text-lg'} mt-2`}>
        {message}
      </p>
      {!isSmall && (
        <p className="text-md my-6">{contactSupport}</p>
      )}
    </div>
  );
}
