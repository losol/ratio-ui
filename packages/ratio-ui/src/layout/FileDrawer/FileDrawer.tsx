// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { useCallback, useEffect, useMemo } from 'react';

import { Button } from '../../core/Button';
import { Drawer } from '../Drawer/Drawer';

export interface FileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Raw file content (HTML string, SVG, etc.) */
  content?: string;
  /** MIME type for the content (default: text/html) */
  contentType?: string;
  /** Direct URL to display (takes precedence over content) */
  src?: string;
  /** If set, shows a download button with this filename */
  downloadFilename?: string;
  /** Label for the download button. @deprecated Use `labels.download`. Still honoured until the next major. */
  downloadLabel?: string;
  /** Label for the close button. @deprecated Use `labels.close`. Still honoured until the next major. */
  closeLabel?: string;
  /** Built-in text. Each entry falls back to English. */
  labels?: FileDrawerLabels;
}

/** Built-in text of `FileDrawer`. Each entry falls back to English. */
export interface FileDrawerLabels {
  /** @default 'Download' */
  download?: string;
  /** @default 'Close' */
  close?: string;
}

/**
 * Drawer that displays file content in an embedded iframe.
 * Accepts either a `src` URL or raw `content` (which is converted to a blob URL internally).
 * Optionally shows a download button when `downloadFilename` is provided.
 */
export const FileDrawer = ({
  isOpen,
  onClose,
  title,
  content,
  contentType = 'text/html',
  src,
  downloadFilename,
  downloadLabel,
  closeLabel,
  labels,
}: FileDrawerProps) => {
  const download = labels?.download ?? downloadLabel ?? 'Download';
  const close = labels?.close ?? closeLabel ?? 'Close';
  const blobUrl = useMemo(() => {
    if (!isOpen || src || !content) return null;
    return URL.createObjectURL(new Blob([content], { type: contentType }));
  }, [isOpen, content, contentType, src]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const iframeSrc = src ?? blobUrl;

  const handleDownload = useCallback(() => {
    if (!iframeSrc) return;
    const a = document.createElement('a');
    a.href = iframeSrc;
    a.download = downloadFilename ?? 'download';
    a.click();
  }, [iframeSrc, downloadFilename]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <Drawer.Header>
        <Drawer.Heading>{title}</Drawer.Heading>
      </Drawer.Header>
      <Drawer.Body className="flex flex-col">
        {iframeSrc && (
          <iframe
            src={iframeSrc}
            sandbox="allow-same-origin"
            className="w-full flex-1 rounded border border-border bg-white"
            title={title}
          />
        )}
      </Drawer.Body>
      <Drawer.Footer>
        {downloadFilename && iframeSrc && (
          <Button onClick={handleDownload} variant="primary">
            {download}
          </Button>
        )}
        <Button onClick={onClose} variant="secondary">
          {close}
        </Button>
      </Drawer.Footer>
    </Drawer>
  );
};
