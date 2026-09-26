// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type React from 'react';
import { ChevronsLeft, ChevronsRight } from '../../icons';

import { Button } from '../Button';
import { Text } from '../Text/Text';

/** Text for `Pagination`, for translating it. Each entry falls back to English. */
export interface PaginationLabels {
  /** Accessible name of the `<nav>` landmark. @default 'Pagination' */
  navigation?: string;
  /** Accessible name of the previous-page button. @default 'Previous Page' */
  previous?: string;
  /** Accessible name of the next-page button. @default 'Next Page' */
  next?: string;
  /** The visible status between the buttons. @default "Page {current} of {total}" */
  status?: (currentPage: number, totalPages: number) => React.ReactNode;
}

export type PaginationProps = {
  onPreviousPageClick: () => void;
  onNextPageClick: () => void;
  currentPage: number;
  totalPages: number;
  /** Visible and screen-reader text, e.g. in Norwegian. */
  labels?: PaginationLabels;
};

const defaultStatus = (currentPage: number, totalPages: number) => (
  <>
    Page <Text as="span">{currentPage}</Text> of <Text as="span">{totalPages}</Text>
  </>
);

export const Pagination: React.FC<PaginationProps> = ({
  onPreviousPageClick,
  onNextPageClick,
  currentPage,
  totalPages,
  labels = {},
}) => {
  const {
    navigation = 'Pagination',
    previous = 'Previous Page',
    next = 'Next Page',
    status = defaultStatus,
  } = labels;

  return (
    <nav aria-label={navigation} className="flex justify-center items-center py-5">
      <Button aria-label={previous} onClick={onPreviousPageClick} disabled={currentPage <= 1}>
        <ChevronsLeft />
      </Button>
      <Text>{status(currentPage, totalPages)}</Text>
      <Button aria-label={next} onClick={onNextPageClick} disabled={currentPage >= totalPages}>
        <ChevronsRight />
      </Button>
    </nav>
  );
};
