// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Spinner } from "../Spinner/Spinner";

export const Loading = () => {
  return (
    <div role="status">
      <Spinner />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
