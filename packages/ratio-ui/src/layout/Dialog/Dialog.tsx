// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { ReactNode, createContext, useContext, useMemo } from 'react';
import {
  Dialog as AriaDialog,
  Heading as AriaHeading,
  Modal,
  ModalOverlay,
} from 'react-aria-components';
import { cn } from '../../utils/cn';
import { OverlayCloseButton, OverlayEyebrow } from '../overlay-chrome';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

// Tailwind max-w utilities (28 / 32 / 42 / 56 rem). All four class
// names are safelisted via `@source inline(...)` in
// libs/ratio-ui/src/global.css because the lookup is dynamic — keep
// that list in sync if you add sizes here.
const sizeClasses: Record<DialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max width of the dialog panel. Defaults to 'md' (~512px). */
  size?: DialogSize;
  testId?: string;
  /** Sets `role="alertdialog"` for prompts that interrupt the user. */
  role?: 'dialog' | 'alertdialog';
  /**
   * Whether clicking the backdrop closes the dialog. Defaults to true.
   * Pair with `isKeyboardDismissDisabled` to fully prevent dismissal.
   */
  isDismissable?: boolean;
  /** When true, Escape no longer closes the dialog. Defaults to false. */
  isKeyboardDismissDisabled?: boolean;
}

// Lets Header render the close button in the header row, same as Drawer.
const DialogContext = createContext<{ onClose?: () => void }>({});

// True inside a Header, so Heading drops its standalone padding there.
const HeaderScopeContext = createContext(false);

const DialogRoot = ({
  isOpen,
  onClose,
  children,
  size,
  testId,
  role = 'dialog',
  isDismissable = true,
  isKeyboardDismissDisabled = false,
}: Readonly<DialogProps>) => {
  const panelWidth = sizeClasses[size ?? 'md'];
  const context = useMemo(() => ({ onClose }), [onClose]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      data-testid={testId}
      className={cn(
        'fixed inset-0 z-100 flex h-full min-h-full min-w-full items-center justify-center overflow-auto p-4 text-center',
        'bg-scrim transition-opacity duration-[320ms] ease-overlay motion-reduce:transition-none',
        'data-[entering]:opacity-0 data-[exiting]:opacity-0',
      )}
    >
      <Modal
        className={cn(
          'w-full',
          panelWidth,
          // Same shell as Drawer — surface, hairline, overlay radius/shadow —
          // anchored center instead of at an edge, sized by its content.
          'flex max-h-[84dvh] flex-col overflow-hidden bg-surface text-left align-middle text-(--text)',
          'rounded-overlay border border-border-2 shadow-overlay',
          // A dialog interrupts, so it arrives faster than a drawer: fade and
          // settle from a slight scale instead of sliding in from an edge.
          'transition-[opacity,scale] duration-[300ms] ease-overlay motion-reduce:transition-none',
          'data-[entering]:opacity-0 data-[entering]:scale-[0.98]',
          'data-[exiting]:opacity-0 data-[exiting]:scale-[0.98]',
        )}
      >
        <AriaDialog role={role} className="relative flex min-h-0 flex-1 flex-col outline-hidden">
          <DialogContext.Provider value={context}>{children}</DialogContext.Provider>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
};

interface DialogSlotProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Header row: eyebrow/heading column plus the close button, rendered for you
 * the same way `Drawer.Header` does it.
 */
function DialogHeader({ children, className }: Readonly<DialogSlotProps>) {
  const { onClose } = useContext(DialogContext);
  return (
    <header
      className={cn('flex shrink-0 items-start gap-3 px-5 pt-4 pb-3.5 md:px-6 md:pt-5', className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <HeaderScopeContext.Provider value>{children}</HeaderScopeContext.Provider>
      </div>
      {onClose && <OverlayCloseButton onPress={onClose} label="Close dialog" />}
    </header>
  );
}

function DialogHeading({ children, className }: Readonly<DialogSlotProps>) {
  const inHeader = useContext(HeaderScopeContext);
  return (
    <AriaHeading
      slot="title"
      level={3}
      // m-0 keeps the global h1-h3 rhythm margins out of the panel; outside a
      // Header the heading pads itself so bare Heading+Content still works.
      className={cn(
        'm-0 text-(--text)',
        !inHeader && 'px-5 pt-4 pb-2 md:px-6 md:pt-5',
        className,
      )}
    >
      {children}
    </AriaHeading>
  );
}

function DialogContent({ children, className }: Readonly<DialogSlotProps>) {
  return (
    <div className={cn('min-h-0 grow overflow-y-auto overscroll-contain px-5 pb-4 md:px-6', className)}>
      {children}
    </div>
  );
}

function DialogFooter({ children, className }: Readonly<DialogSlotProps>) {
  return (
    <footer
      className={cn(
        'flex shrink-0 flex-wrap items-center justify-end gap-2.5',
        'border-t border-border-1 px-5 pt-3.5 pb-5 md:px-6',
        className,
      )}
    >
      {children}
    </footer>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Header: DialogHeader,
  Eyebrow: OverlayEyebrow,
  Heading: DialogHeading,
  Content: DialogContent,
  Footer: DialogFooter,
});
