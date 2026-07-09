// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

declare module '*.md?raw' {
  const content: string;
  export default content;
}

declare module '*.mdx?raw' {
  const content: string;
  export default content;
}

