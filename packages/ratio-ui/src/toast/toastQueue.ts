// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { UNSTABLE_ToastQueue as ToastQueue } from 'react-aria-components';

import type { Status } from '../tokens/colors';

export interface ToastContent {
  message: string;
  status: Status;
  description?: string;
}

export const toastQueue = new ToastQueue<ToastContent>({
  maxVisibleToasts: 5,
});
