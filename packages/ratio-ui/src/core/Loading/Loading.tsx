// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Spinner } from "../Spinner/Spinner";

/** Built-in text of `Loading`. Each entry falls back to English. */
export interface LoadingLabels {
  /** The status announced (and shown with `showLabel`). @default 'Loading…' */
  loading?: string;
}

export interface LoadingProps {
  labels?: LoadingLabels;
  /** Show the text next to the spinner instead of only announcing it. */
  showLabel?: boolean;
}

export const Loading = ({ labels, showLabel = false }: LoadingProps) => {
  const { loading = 'Loading…' } = labels ?? {};

  return (
    <div role="status" className={showLabel ? 'inline-flex items-center gap-2' : undefined}>
      <Spinner />
      <span className={showLabel ? 'text-sm text-(--text-muted)' : 'sr-only'}>{loading}</span>
    </div>
  );
};
