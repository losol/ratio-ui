// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { Card } from './Card';

export const htmlAttributes = (
  <Card
    as="section"
    id="answers"
    role="region"
    aria-labelledby="answers-title"
    data-ui="card"
  />
);

export const collapsibleToggle = (
  <Card
    collapsible
    onToggle={(open) => {
      const next: boolean = open;
      void next;
    }}
  />
);
