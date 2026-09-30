import React from 'react';
import { Panel, type PanelStatus } from '@eventuras/ratio-ui/core/Panel';
import {
  AlertTriangle,
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
} from '@eventuras/ratio-ui/icons';

/** Titles of the five GitHub alert types. Each falls back to English. */
export interface CalloutLabels {
  /** @default 'Note' */
  note?: string;
  /** @default 'Tip' */
  tip?: string;
  /** @default 'Important' */
  important?: string;
  /** @default 'Warning' */
  warning?: string;
  /** @default 'Caution' */
  caution?: string;
}

type CalloutKey = keyof CalloutLabels;

const CALLOUTS: Record<
  CalloutKey,
  { status: PanelStatus; Icon: React.ComponentType; label: string; className?: string }
> = {
  note: { status: 'info', Icon: Info, label: 'Note' },
  tip: { status: 'success', Icon: Lightbulb, label: 'Tip' },
  // No status token fits "important", so it takes the primary colour to
  // stand apart from NOTE.
  important: {
    status: 'neutral',
    Icon: MessageSquareWarning,
    label: 'Important',
    className: '[--panel-solid:var(--primary)] [--panel-text:var(--primary)]',
  },
  warning: { status: 'warning', Icon: AlertTriangle, label: 'Warning' },
  caution: { status: 'error', Icon: OctagonAlert, label: 'Caution' },
};

const toKey = (type: string | undefined): CalloutKey => {
  const key = type?.toLowerCase();
  return key && key in CALLOUTS ? (key as CalloutKey) : 'note';
};

/**
 * Component overrides for the `callout` elements `remarkCallout` produces
 * from GitHub alerts (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`,
 * `> [!WARNING]`, `> [!CAUTION]`), rendered as a ratio-ui `Panel` with the
 * type's icon and title. `MarkdownContent` uses these by default; call this
 * directly to render callouts with another markdown setup.
 */
export const createCalloutComponents = (labels: CalloutLabels = {}) => ({
  callout: ({
    children,
    'data-callout-type': type,
  }: {
    children?: React.ReactNode;
    'data-callout-type'?: string;
  }) => {
    const key = toKey(type);
    const { status, Icon, label, className } = CALLOUTS[key];
    return (
      // Static content, not a live update: no status/alert role.
      <Panel
        status={status}
        accent="flush"
        surface="transparent"
        role={null}
        marginBottom="md"
        className={className}
      >
        <Panel.Header icon={<Icon />} className="pb-1.5">
          <Panel.Title className="text-(--panel-text)">{labels[key] ?? label}</Panel.Title>
        </Panel.Header>
        <Panel.Body className="[&>:first-child]:mt-0 [&>:last-child]:mb-0 [&>:last-child]:pb-0">{children}</Panel.Body>
      </Panel>
    );
  },
});

/** The callout overrides with English titles. */
export const calloutComponents = createCalloutComponents();
