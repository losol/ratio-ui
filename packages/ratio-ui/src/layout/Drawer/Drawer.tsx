// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import React, { createContext, ReactNode, useContext, useMemo, useRef } from 'react';
import {
  Dialog as AriaDialog,
  Heading as AriaHeading,
  Modal,
  ModalOverlay,
} from 'react-aria-components';

import { ActionButton } from '../../core/ActionButton';
import { X } from '../../icons';
import { cn } from '../../utils/cn';
import { OverlayCloseButton, OverlayEyebrow } from '../overlay-chrome';
import { useSheetDrag } from './useSheetDrag';

export type DrawerSize = 'responsive' | 'sm' | 'md' | 'lg' | 'xl';
export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

// Same width scale as Dialog (28 / 32 / 42 / 56 rem), so a panel is the same
// size whichever way it arrives on screen.
const sizeClasses: Record<Exclude<DrawerSize, 'responsive'>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export interface DrawerProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  /**
   * Which edge the drawer slides from. Navigation sheets conventionally come
   * from the left, detail/inspector panels from the right, action sheets
   * from the bottom, and notification trays from the top. @default 'right'
   */
  side?: DrawerSide;
  /**
   * Width cap on the same `sm | md | lg | xl` scale as `Dialog`.
   * `'responsive'` (the default) keeps a left/right drawer at a viewport
   * fraction, and centers a top/bottom sheet in a 620px column. Prefer a
   * named size for an inspector or activity panel, which wants a column,
   * not half the page.
   * @default 'responsive'
   */
  size?: DrawerSize;
  /** Merged onto the drawer panel — the escape hatch when `size` isn't enough. */
  className?: string;
  /** Whether clicking the backdrop closes the drawer. Defaults to true. */
  isDismissable?: boolean;
  /** When true, Escape no longer closes the drawer. Defaults to false. */
  isKeyboardDismissDisabled?: boolean;
  /**
   * Whether the backdrop dims the page. Set false on a drawer stacked above
   * another drawer, so the page keeps a single scrim instead of darkening a
   * step per level. @default true
   */
  scrim?: boolean;
  /**
   * How many sheets are currently open above this one. Each step nudges the
   * sheet 24px toward the page center so a stack reads as a pile, the way
   * the top sheet's back-link promises something underneath. @default 0
   */
  stackOffset?: number;
}

interface DrawerChildProps {
  children: ReactNode;
  className?: string;
}

interface HeaderProps extends DrawerChildProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

type BodyProps = DrawerChildProps;
type FooterProps = DrawerChildProps;
type EyebrowProps = DrawerChildProps;

interface HeadingSlotProps {
  children?: ReactNode;
  className?: string;
  /** Heading level (h1-h6). Defaults to 2. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface DrawerComponent extends React.FC<DrawerProps> {
  Header: React.FC<HeaderProps>;
  Heading: React.FC<HeadingSlotProps>;
  Eyebrow: React.FC<EyebrowProps>;
  Body: React.FC<BodyProps>;
  Footer: React.FC<FooterProps>;
}

// Lets Header render the close button in the header row instead of the
// Drawer absolutely positioning one over the content.
const DrawerContext = createContext<{ onClose?: () => void }>({});

// Family easing token (shared with Dialog) — a fast launch that settles softly.
const easing = 'ease-overlay motion-reduce:transition-none';

const Drawer: DrawerComponent = ({
  isOpen,
  onClose,
  children,
  side = 'right',
  size = 'responsive',
  className,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  scrim = true,
  stackOffset = 0,
}: DrawerProps) => {
  const isHorizontal = side === 'left' || side === 'right';
  const context = useMemo(() => ({ onClose }), [onClose]);

  // Drag-to-dismiss on the handle — sheets only, and only when the drawer is
  // dismissable at all. Escape/backdrop/close button stay the a11y paths.
  const sheetRef = useRef<HTMLDivElement>(null);
  const canDrag = !isHorizontal && !!onClose && isDismissable;
  const dragHandlers = useSheetDrag({
    sheetRef,
    side: side === 'top' ? 'top' : 'bottom',
    onDismiss: () => onClose?.(),
  });

  // The handle sits at the grab edge: top of a bottom sheet, bottom of a top
  // sheet — where the swipe lives. The drag zone is a centered strip a good
  // bit larger than the pill, overlapping ~28px into the neighboring slot via
  // negative margin (z-10 wins the hit test there) — kept narrow enough to
  // never cover the close button in the corner.
  const handle = !isHorizontal ? (
    <div aria-hidden className="flex shrink-0 justify-center">
      <div
        className={cn(
          'z-10 flex items-start justify-center px-14',
          side === 'bottom' ? '-mb-7 pt-2.5 pb-7' : '-mt-7 items-end pt-7 pb-2.5',
          canDrag && 'cursor-grab touch-none select-none active:cursor-grabbing',
        )}
        {...(canDrag ? dragHandlers : {})}
      >
        <div className="h-1 w-10 rounded-full bg-border-2" />
      </div>
    </div>
  ) : null;

  // Header renders the close button in its own row; only a drawer without a
  // Header falls back to the floating button.
  const hasHeader = React.Children.toArray(children).some(
    child => React.isValidElement(child) && child.type === Header,
  );

  // Stack shift rides the `transform` property; enter/exit slides use the
  // separate `translate` property, so the two compose instead of fighting.
  const shift = stackOffset * 24;
  const stackTransform =
    shift > 0
      ? isHorizontal
        ? `translateX(${side === 'right' ? -shift : shift}px)`
        : `translateY(${side === 'bottom' ? -shift : shift}px)`
      : undefined;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) onClose?.();
      }}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      className={cn(
        'fixed inset-0 z-30',
        scrim ? 'bg-scrim' : 'bg-transparent',
        'transition-opacity duration-[320ms]',
        easing,
        'data-[entering]:opacity-0 data-[exiting]:opacity-0',
      )}
    >
      <Modal
        ref={sheetRef}
        style={stackTransform ? { transform: stackTransform } : undefined}
        className={cn(
          // Floating sheet: detached from the edge on all four sides, so the
          // panel reads as a layer above the page rather than a page split.
          'fixed flex flex-col overflow-hidden bg-surface',
          'rounded-overlay border border-border-2 shadow-overlay',
          'transition-[translate,transform] duration-[420ms]',
          easing,
          // Horizontal drawers: full height inside the inset. Width is either
          // the original viewport fraction or a capped column.
          isHorizontal && 'inset-y-2.5 md:inset-y-5',
          isHorizontal &&
            (size === 'responsive'
              ? 'w-11/12 md:w-10/12 lg:w-7/12 2xl:w-8/12'
              : cn('w-11/12', sizeClasses[size])),
          side === 'left' &&
            'left-2.5 md:left-5 data-[entering]:translate-x-[calc(-100%_-_24px)] data-[exiting]:translate-x-[calc(-100%_-_24px)]',
          side === 'right' &&
            'right-2.5 md:right-5 data-[entering]:translate-x-[calc(100%_+_24px)] data-[exiting]:translate-x-[calc(100%_+_24px)]',
          // Vertical drawers (sheets): centered in a column on wide screens —
          // a sheet spanning a 2560px display is a strip, not a sheet.
          !isHorizontal && 'inset-x-2.5 mx-auto md:inset-x-5',
          !isHorizontal &&
            (size === 'responsive' ? 'max-w-[38.75rem]' : sizeClasses[size]),
          side === 'top' &&
            'top-2.5 max-h-[70dvh] md:top-5 md:max-h-[76dvh] data-[entering]:translate-y-[calc(-100%_-_24px)] data-[exiting]:translate-y-[calc(-100%_-_24px)]',
          side === 'bottom' &&
            'bottom-2.5 max-h-[86dvh] md:bottom-5 md:max-h-[76dvh] data-[entering]:translate-y-[calc(100%_+_24px)] data-[exiting]:translate-y-[calc(100%_+_24px)]',
          className,
        )}
      >
        <AriaDialog className="relative flex min-h-0 flex-1 flex-col outline-hidden">
          {side === 'bottom' && handle}
          <DrawerContext.Provider value={context}>
            {onClose && !hasHeader && (
              <ActionButton
                round
                variant="ghost"
                size="lg"
                onPress={onClose}
                className="absolute top-3 right-3 z-10"
                ariaLabel="Close drawer"
              >
                <X size={18} />
              </ActionButton>
            )}
            {children}
          </DrawerContext.Provider>
          {side === 'top' && handle}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
};

// m-0 keeps the global h1-h3 rhythm margins out of the header row.
const headingClass = 'm-0 text-2xl font-bold text-(--text)';

const Header: React.FC<HeaderProps> = ({ as, children, className }) => {
  const { onClose } = useContext(DrawerContext);

  // When `as` is set, render the heading as a slotted RAC Heading so the
  // dialog gets its accessible name auto-wired via aria-labelledby.
  let content = children;
  if (as) {
    const level = parseInt(as.charAt(1), 10) as 1 | 2 | 3 | 4 | 5 | 6;
    content = (
      <AriaHeading slot="title" level={level} className={headingClass}>
        {children}
      </AriaHeading>
    );
  }

  return (
    <header
      className={cn('flex shrink-0 items-start gap-3 px-5 pt-4 pb-3.5 md:px-6 md:pt-5', className)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">{content}</div>
      {onClose && <OverlayCloseButton onPress={onClose} label="Close drawer" />}
    </header>
  );
};

const DrawerHeading: React.FC<HeadingSlotProps> = ({ children, className, level = 2 }) => (
  <AriaHeading slot="title" level={level} className={cn(headingClass, className)}>
    {children}
  </AriaHeading>
);

const Eyebrow: React.FC<EyebrowProps> = OverlayEyebrow;

const Body: React.FC<BodyProps> = ({ children, className }) => (
  <div className={cn('min-h-0 grow overflow-y-auto overscroll-contain px-5 pb-4 md:px-6', className)}>
    {children}
  </div>
);

const Footer: React.FC<FooterProps> = ({ children, className }) => (
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

Drawer.Header = Header;
Drawer.Heading = DrawerHeading;
Drawer.Eyebrow = Eyebrow;
Drawer.Body = Body;
Drawer.Footer = Footer;

export { Drawer };
