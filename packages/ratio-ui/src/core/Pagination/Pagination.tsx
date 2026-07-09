// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { ChevronsLeft, ChevronsRight } from '../../icons';

import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

export type PaginationProps = {
  onPreviousPageClick: () => void;
  onNextPageClick: () => void;
  currentPage: number;
  totalPages: number;
};

export const Pagination: React.FC<PaginationProps> = ({
  onPreviousPageClick,
  onNextPageClick,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="flex justify-center items-center py-5">
      <Button aria-label="Previous Page" onClick={onPreviousPageClick} disabled={currentPage <= 1}>
        <ChevronsLeft />
      </Button>
      <Text>
        Page <Text as="span">{currentPage}</Text> of <Text as="span">{totalPages}</Text>
      </Text>
      <Button aria-label="Next Page" onClick={onNextPageClick} disabled={currentPage >= totalPages}>
        <ChevronsRight />
      </Button>
    </div>
  );
};
