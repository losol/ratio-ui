// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import {
  Children,
  isValidElement,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react';
import {
  Button as AriaButton,
  Header as AriaHeader,
  Menu as AriaMenu,
  MenuItem,
  MenuItemProps,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  Popover,
  type PopoverProps,
  Separator as AriaSeparator,
  type Key,
  type Selection,
} from 'react-aria-components';
import { Check, ChevronDown, Sun, Moon } from '../../icons';
import { cn } from '../../utils/cn';

const styles = {
  popover: cn(
    'flex flex-col min-w-[280px] max-w-sm origin-top-right border border-border-1 rounded-xl overflow-hidden',
    // Light-mode glow: multi-layer primary-tinted box-shadow gives the
    // popover a soft editorial lift on the light surface.
    'shadow-[0_1px_0_color-mix(in_oklch,var(--primary)_6%,transparent),0_12px_28px_color-mix(in_oklch,var(--primary)_18%,transparent),0_4px_8px_color-mix(in_oklch,var(--primary)_12%,transparent)]',
    // Dark-mode shadow: primary-tinted shadows wash out on the dark
    // surface, so the design uses a thin white top-highlight + black
    // depth shadows for separation.
    'dark:shadow-[0_1px_0_rgb(255_255_255/0.08),0_16px_36px_rgb(0_0_0/0.6),0_4px_12px_rgb(0_0_0/0.4)]',
    // Pop-in / pop-out animation. React Aria Popover sets
    // `data-entering` / `data-exiting`; we transition opacity +
    // transform from a slightly-scaled, slightly-up state into the
    // resting position for a short editorial pop.
    'transition-[opacity,transform] duration-150 ease-out',
    'data-[entering]:opacity-0 data-[entering]:-translate-y-1 data-[entering]:scale-[0.98]',
    'data-[exiting]:opacity-0 data-[exiting]:-translate-y-1 data-[exiting]:scale-[0.98]',
  ),
  menuItemsList: 'bg-card focus:outline-hidden p-1.5 min-h-0 flex-1 overflow-y-auto overscroll-contain',
  // Rounded, icon-friendly rows (no per-row borders). `data-current` draws the
  // accent bar + tint for the active row; `group` lets the icon slot follow
  // hover/current color.
  menuItem: cn(
    'cursor-pointer group relative flex w-full items-center gap-[11px] rounded-lg px-[11px] py-[9px]',
    '[font-size:var(--menu-font-size,14px)] [font-weight:var(--menu-font-weight,400)] text-(--text) transition-colors hover:bg-card-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
    'data-[current]:text-(--primary) data-[current]:bg-[color-mix(in_oklch,var(--accent)_12%,transparent)]',
    'data-[current]:before:content-[""] data-[current]:before:absolute data-[current]:before:left-[3px]',
    'data-[current]:before:top-2 data-[current]:before:bottom-2 data-[current]:before:w-[3px]',
    'data-[current]:before:rounded-[3px] data-[current]:before:bg-(--accent)',
  ),
  menuItemDanger: cn(
    'text-(--error-solid)',
    'hover:bg-[color-mix(in_oklch,var(--error-solid)_14%,transparent)] hover:text-(--error-solid)',
  ),
  itemIcon: cn(
    'shrink-0 text-(--text-subtle) transition-colors group-hover:text-(--text)',
    'group-data-[current]:text-(--primary)',
    '[&>svg]:h-[17px] [&>svg]:w-[17px]',
  ),
  itemIconDanger: 'text-(--error-solid) group-hover:text-(--error-solid)',
  // T2 trigger: outline pill that fills with primary and glows when open;
  // the chevron cap rotates via `in-aria-expanded` (see MenuChevron).
  triggerDefault: cn(
    'group inline-flex min-w-[150px] cursor-pointer items-center justify-between gap-3',
    'rounded-full border-[1.5px] py-2 pl-4 pr-2.5 [font-size:var(--menu-font-size,14px)] font-semibold',
    'border-primary-400 text-primary-700 dark:border-primary-500 dark:text-primary-300 bg-transparent',
    'transition-all duration-200 active:scale-[0.96]',
    'hover:bg-[color-mix(in_oklch,var(--color-primary-400)_14%,transparent)] hover:text-primary-800 dark:hover:text-primary-200',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-(--focus-ring)',
    'aria-expanded:bg-primary-300 aria-expanded:border-primary-300 aria-expanded:text-primary-950',
    'aria-expanded:shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-primary-400)_30%,transparent),0_4px_14px_-2px_color-mix(in_oklch,var(--color-primary-400)_55%,transparent)]',
  ),
  section: '',
  sectionLabel:
    'block px-3 pt-2 pb-1 text-[10.5px] font-bold uppercase tracking-[0.07em] text-(--text-subtle)',
};

type MenuActionsApi = {
  register: (id: string, fn: () => void) => void;
  unregister: (id: string) => void;
};
const MenuActionsContext = createContext<MenuActionsApi>({
  register: () => {},
  unregister: () => {},
});

export type MenuTriggerProps = {
  children: ReactNode;
  /**
   * Override the default pill-shaped primary button styling. Pass any
   * Tailwind / utility classes to fully restyle the trigger (e.g. an
   * avatar pill or icon-only button). When omitted, the default
   * `--primary` rounded-full button is used.
   */
  className?: string;
  testId?: string;
};

const MenuTrigger = ({ children, className, testId }: MenuTriggerProps) => (
  <AriaButton
    data-testid={testId ?? 'logged-in-menu-button'}
    className={className ?? styles.triggerDefault}
  >
    {children}
  </AriaButton>
);
MenuTrigger.displayName = 'Menu.Trigger';

export type MenuLinkProps = {
  href: string;
  children: ReactNode;
  /** Leading icon — pass any element; sized to 17px (e.g. `<User />`). */
  icon?: ReactNode;
  /** Mark as the current page — accent bar + tint, `aria-current="page"`. */
  isCurrent?: boolean;
  /** `danger` renders the row in the error color (e.g. "Log out"). */
  variant?: 'default' | 'danger';
  testId?: string;
};

const MenuLink = ({ icon, isCurrent, variant, children, testId, ...rest }: MenuLinkProps & MenuItemProps) => (
  <MenuItem
    {...rest}
    aria-current={isCurrent ? 'page' : undefined}
    data-current={isCurrent || undefined}
    data-testid={testId}
    className={cn(styles.menuItem, variant === 'danger' && styles.menuItemDanger)}
  >
    {icon && (
      <span aria-hidden className={cn(styles.itemIcon, variant === 'danger' && styles.itemIconDanger)}>
        {icon}
      </span>
    )}
    <span className="min-w-0 flex-1">{children}</span>
  </MenuItem>
);

export type MenuProps = {
  children: ReactNode;
  /**
   * Where the popover opens relative to the trigger — e.g. `'top end'` for a
   * menu in a sidebar footer. Mirrors React Aria's Popover. @default 'bottom end'
   */
  placement?: PopoverProps['placement'];
  /** Controlled open state. Mirrors React Aria's MenuTrigger. */
  isOpen?: boolean;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Fires when the menu opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Cap the popover height in px. Without it the menu still caps itself to
   * the available viewport space (React Aria) — either way the item list
   * scrolls while the identity header stays pinned. Mirrors React Aria.
   */
  maxHeight?: number;
};

export type MenuButtonProps = {
  id: string;
  children: ReactNode;
  onClick: () => void;
  /** Leading icon — pass any element; sized to 17px (e.g. `<LogOut />`). */
  icon?: ReactNode;
  /** `danger` renders the row in the error color (e.g. "Log out"). */
  variant?: 'default' | 'danger';
  testId?: string;
};

export type MenuThemeToggleProps = {
  theme?: 'light' | 'dark' | null;
  onThemeChange: (theme: 'light' | 'dark') => void;
  lightLabel?: string;
  darkLabel?: string;
};

const Menu = ({ children, placement = 'bottom end', isOpen, defaultOpen, onOpenChange, maxHeight }: MenuProps) => {
  const actionsRef = useRef(new Map<string, () => void>());
  const headerLabelId = useId();

  const api = useRef<MenuActionsApi>({
    register: (id, fn) => actionsRef.current.set(id, fn),
    unregister: (id) => actionsRef.current.delete(id),
  }).current;

  // Split children:
  //   - first <Menu.Trigger>      → React Aria's button (next to Popover)
  //   - first <Menu.Header>       → rendered inside Popover but OUTSIDE
  //                                 AriaMenu (it's not a navigable item;
  //                                 AriaMenu strips non-MenuItem children)
  //   - everything else           → menu items inside AriaMenu
  let trigger: ReactNode = null;
  let header: ReactNode = null;
  const items: ReactNode[] = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement(child)) {
      if (child.type === MenuTrigger) {
        if (trigger === null) trigger = child;
        continue;
      }
      if (child.type === MenuHeader) {
        if (header === null) header = child;
        continue;
      }
    }
    items.push(child);
  }
  if (trigger === null) {
    throw new Error(
      'Menu requires a <Menu.Trigger> child. Wrap the trigger label/content in <Menu.Trigger>...</Menu.Trigger>.',
    );
  }

  return (
    <AriaMenuTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger}
      <Popover placement={placement} maxHeight={maxHeight} className={styles.popover}>
        {header && <div id={headerLabelId} className="shrink-0 bg-card">{header}</div>}
        <MenuActionsContext.Provider value={api}>
          <AriaMenu
            className={styles.menuItemsList}
            // When a Menu.Header is present, point the menu's accessible
            // name at it so screen readers announce the user identity
            // when arrow-keying into the first item, instead of jumping
            // straight past the visually-rendered header.
            aria-labelledby={header ? headerLabelId : undefined}
            onAction={key => {
              const fn = actionsRef.current.get(key.toString());
              if (fn) fn();
            }}
          >
            {items}
          </AriaMenu>
        </MenuActionsContext.Provider>
      </Popover>
    </AriaMenuTrigger>
  );
};

const MenuButton = (props: MenuButtonProps & MenuItemProps) => {
  const { register, unregister } = useContext(MenuActionsContext);

  useEffect(() => {
    register(props.id, props.onClick);
    return () => unregister(props.id);
  }, [props.id, props.onClick, register, unregister]);

  // `onClick` fires via the actions registry (registered in the effect
  // above), so it must not reach the DOM spread.
  const { icon, variant, children, testId, onClick, ...rest } = props;
  void onClick;
  return (
    <MenuItem
      {...rest}
      className={cn(styles.menuItem, variant === 'danger' && styles.menuItemDanger)}
      data-testid={testId}
    >
      {icon && (
        <span aria-hidden className={cn(styles.itemIcon, variant === 'danger' && styles.itemIconDanger)}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </MenuItem>
  );
};

const MenuThemeToggle = ({
  theme,
  onThemeChange,
  lightLabel = 'Light theme',
  darkLabel = 'Dark theme',
}: MenuThemeToggleProps) => {
  const isDark = theme === 'dark';
  const id = useId();
  const { register, unregister } = useContext(MenuActionsContext);

  const handlerRef = useRef(onThemeChange);
  handlerRef.current = onThemeChange;
  const themeRef = useRef(isDark);
  themeRef.current = isDark;

  useEffect(() => {
    register(id, () => handlerRef.current(themeRef.current ? 'light' : 'dark'));
    return () => unregister(id);
  }, [id, register, unregister]);

  return (
    <MenuItem id={id} className={styles.menuItem}>
      <span className="flex items-center gap-2">
        {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
        {isDark ? lightLabel : darkLabel}
      </span>
    </MenuItem>
  );
};

export type MenuSectionProps = {
  /** Uppercase eyebrow label above the section's items (e.g. "Language"). */
  label?: string;
  children: ReactNode;
  /**
   * Make the section selectable — selected `Menu.Option`s get a check mark.
   * Mirrors React Aria's section-level selection.
   */
  selectionMode?: 'single' | 'multiple';
  /** Controlled selection (the set of active option `id`s). */
  selectedKeys?: Iterable<Key>;
  /** Uncontrolled initial selection. */
  defaultSelectedKeys?: Iterable<Key>;
  /** Mirrors React Aria: `Selection` is `'all' | Set<Key>`. */
  onSelectionChange?: (keys: Selection) => void;
  /** Forbid clearing the last selected option — "exactly one". */
  disallowEmptySelection?: boolean;
  /**
   * Whether picking an option closes the menu. Set `false` for pickers the
   * user may want to compare (e.g. themes) without reopening. Mirrors React
   * Aria. @default true
   */
  shouldCloseOnSelect?: boolean;
  className?: string;
};

/**
 * Group of menu items with an optional uppercase eyebrow label. Pass
 * `selectionMode` to make the section selectable — pair it with
 * {@link MenuOption} rows, which render a check mark when selected
 * (the language-picker / view-as pattern in user menus).
 *
 * @beta API may evolve before release.
 */
const MenuSection = ({ label, children, className, ...selection }: MenuSectionProps) => (
  <AriaMenuSection {...selection} className={cn(styles.section, className)}>
    {label && <AriaHeader className={styles.sectionLabel}>{label}</AriaHeader>}
    {children}
  </AriaMenuSection>
);
MenuSection.displayName = 'Menu.Section';

export type MenuOptionProps = {
  /** Identity within the selectable section — reported in `selectedKeys`. */
  id: string;
  children: ReactNode;
  /** Disable just this option. */
  isDisabled?: boolean;
  /** Plain-text value for typeahead when `children` isn't plain text. */
  textValue?: string;
  testId?: string;
};

/**
 * Selectable row for a `Menu.Section` with `selectionMode` — shows a
 * primary-colored check mark when selected.
 *
 * @beta API may evolve before release.
 */
const MenuOption = ({ id, children, isDisabled, textValue, testId }: MenuOptionProps) => (
  <MenuItem
    id={id}
    isDisabled={isDisabled}
    textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
    className={styles.menuItem}
    data-testid={testId}
  >
    {({ isSelected }) => (
      <>
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {isSelected && (
          <Check aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 text-(--primary)" />
        )}
      </>
    )}
  </MenuItem>
);
MenuOption.displayName = 'Menu.Option';

export type MenuSeparatorProps = {
  className?: string;
};

/**
 * Semantic divider between menu regions (announced as a separator, not just
 * drawn) — e.g. before a "Log out" action. Wraps React Aria's `Separator`.
 *
 * @beta API may evolve before release.
 */
const MenuSeparator = ({ className }: MenuSeparatorProps) => (
  <AriaSeparator className={cn('mx-2 my-1.5 h-px border-0 bg-border-1 opacity-70', className)} />
);
MenuSeparator.displayName = 'Menu.Separator';

/**
 * Convenience: the chevron used by the default trigger pattern. Exported
 * so consumers can drop it into a custom `Menu.Trigger` without having to
 * reach into `../icons` themselves.
 */
const MenuChevron = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      // The "cap": a small circle that carries the chevron. It rotates and
      // brightens when the trigger it sits in is expanded (menu open).
      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
      'bg-[color-mix(in_oklch,var(--color-primary-400)_22%,transparent)]',
      'transition-all duration-300 in-aria-expanded:rotate-180 in-aria-expanded:bg-white/30',
      className,
    )}
  >
    {/* Sized relative to the cap so consumer overrides of the wrapper scale the icon too. */}
    <ChevronDown className="h-[62.5%] w-[62.5%]" strokeWidth={2.4} />
  </span>
);
MenuChevron.displayName = 'Menu.Chevron';

// ── Menu.Header (beta) ────────────────────────────────────────────
//
// Identity block at the top of a user-menu dropdown. Composes the
// `Avatar` (or any leading node) with three meta slots — Name, Email,
// Role — into a flex row above a hairline border.

interface MenuHeaderSlotProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Display name for the user-menu identity header. Serif, mid-weight,
 * `--text` color, ellipsised when it overflows the meta column.
 *
 * @beta API may evolve before release.
 */
const MenuHeaderName = ({ children, className }: MenuHeaderSlotProps) => (
  <h4
    className={cn(
      'font-serif font-semibold text-[16px] leading-tight tracking-tight',
      'text-(--text) m-0 truncate',
      className,
    )}
  >
    {children}
  </h4>
);
MenuHeaderName.displayName = 'Menu.Header.Name';

/**
 * Secondary line in the identity header — typically the user's email.
 * Sans, small, muted, ellipsised.
 *
 * @beta API may evolve before release.
 */
const MenuHeaderEmail = ({ children, className }: MenuHeaderSlotProps) => (
  <p
    className={cn(
      'text-[12.5px] text-(--text-muted) m-0 truncate mt-0.5',
      className,
    )}
  >
    {children}
  </p>
);
MenuHeaderEmail.displayName = 'Menu.Header.Email';

/**
 * Optional role / permission chip beneath the name + email — an outline
 * accent badge in caps. Use for short labels like "Admin", "Owner", or
 * org-role descriptors.
 *
 * @beta API may evolve before release.
 */
const MenuHeaderRole = ({ children, className }: MenuHeaderSlotProps) => (
  <span
    className={cn(
      'self-start mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full',
      'text-[10px] uppercase tracking-[0.06em] font-bold',
      'text-(--accent) border border-(--accent)',
      className,
    )}
  >
    {children}
  </span>
);
MenuHeaderRole.displayName = 'Menu.Header.Role';

const META_SLOTS = new Set<unknown>([MenuHeaderName, MenuHeaderEmail, MenuHeaderRole]);

/**
 * Identity block for the top of a user-menu dropdown. Composes a
 * leading node (typically `<Avatar>`) with the meta slots
 * `Menu.Header.Name`, `Menu.Header.Email`, and `Menu.Header.Role`.
 *
 * The component walks its children and groups the meta slots into a
 * flex column to the right of any non-meta children, so consumers
 * write the natural reading order without wrapping the meta column
 * themselves.
 *
 * @beta API may evolve before release.
 *
 * @example
 * ```tsx
 * <Menu.Header>
 *   <Avatar name="Leo Losen" size="lg" />
 *   <Menu.Header.Name>Leo Losen</Menu.Header.Name>
 *   <Menu.Header.Email>leo@losen.com</Menu.Header.Email>
 *   <Menu.Header.Role>Admin</Menu.Header.Role>
 * </Menu.Header>
 * ```
 */
const MenuHeader = ({ children, className }: MenuHeaderSlotProps) => {
  const childArray = Children.toArray(children);
  const meta: ReactNode[] = [];
  const lead: ReactNode[] = [];
  for (const child of childArray) {
    if (isValidElement(child) && META_SLOTS.has(child.type)) {
      meta.push(child);
    } else {
      lead.push(child);
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3.5 px-4 py-4',
        'border-b border-border-1',
        className,
      )}
    >
      {lead}
      {meta.length > 0 && <div className="flex flex-col min-w-0 flex-1">{meta}</div>}
    </div>
  );
};
MenuHeader.displayName = 'Menu.Header';

export default Object.assign(Menu, {
  Trigger: MenuTrigger,
  Chevron: MenuChevron,
  Link: MenuLink,
  Button: MenuButton,
  Section: MenuSection,
  Option: MenuOption,
  Separator: MenuSeparator,
  ThemeToggle: MenuThemeToggle,
  Header: Object.assign(MenuHeader, {
    Name: MenuHeaderName,
    Email: MenuHeaderEmail,
    Role: MenuHeaderRole,
  }),
});
