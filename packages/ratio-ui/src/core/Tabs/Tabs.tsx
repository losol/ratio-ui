// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

'use client';

import React, { ReactElement } from 'react';
import { Tab, TabList, TabPanel, Tabs as AriaTabs } from 'react-aria-components';
import { cn } from '../../utils/cn';

export type TabItemProps = {
  id?: string;
  title: string;
  children: React.ReactNode | null;
  /** Disable just this tab (not focusable, not selectable). */
  isDisabled?: boolean;
  testId?: string;
};

export type TabsProps = {
  children: React.ReactNode;
  defaultSelectedKey?: string;
  selectedKey?: string;
  onSelectionChange?: (key: string) => void;
  className?: string;
};

export interface TabsComponent extends React.FC<TabsProps> {
  Item: React.FC<TabItemProps>;
}

// Chrome-less underline tabs: the active tab's 2px underline overlaps the
// list's hairline rule via -mb-px; inactive tabs are muted text only, and the
// panel has no frame — content sits directly on the surface.
const styles = {
  tabList: 'flex gap-1 list-none overflow-x-auto border-b border-border-1',
  tab: {
    base: 'font-semibold py-2.5 px-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring) transition-colors whitespace-nowrap -mb-px border-b-2',
    selected: 'border-(--primary) text-(--text)',
    notSelected: 'border-transparent text-(--text-muted) hover:text-(--text)',
  },
  panel: 'pt-4',
};

/**
 * Collect the `Tabs.Item` children, unwrapping fragments along the way.
 * `React.Children.toArray` flattens arrays but treats a `<>…</>` fragment as a
 * single opaque child — so items wrapped in one produced a lone tab with
 * `title`/`id` of `undefined` (an empty, unlabeled pill) instead of the tabs.
 */
function collectItems(children: React.ReactNode): ReactElement<TabItemProps>[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) return [];
    if (child.type === React.Fragment) {
      return collectItems((child.props as { children?: React.ReactNode; }).children);
    }
    return [child as ReactElement<TabItemProps>];
  });
}

/**
 * Tabs — accessible tabs built on React Aria's `Tabs`, with token-driven,
 * chrome-less underline styling: a 2px active underline over a hairline rule,
 * muted inactive labels, unframed panels. Provide one or more
 * `<Tabs.Item title="…">…</Tabs.Item>` children (a fragment around them is
 * fine); selection is controllable via `selectedKey` / `onSelectionChange` or
 * uncontrolled via `defaultSelectedKey`.
 */
export const Tabs: TabsComponent = ({
  children,
  defaultSelectedKey,
  selectedKey,
  onSelectionChange,
  className,
}) => {
  const validChildren = collectItems(children);

  return (
    <AriaTabs
      className={className}
      defaultSelectedKey={defaultSelectedKey}
      selectedKey={selectedKey}
      onSelectionChange={(key) => onSelectionChange?.(String(key))}
    >
      <TabList className={styles.tabList}>
        {validChildren.map((child) => {
          const id = child.props.id ?? child.props.title;
          return (
            <Tab
              key={id}
              id={id}
              isDisabled={child.props.isDisabled}
              data-testid={child.props.testId}
              className={({ isSelected, isDisabled }) =>
                cn(
                  styles.tab.base,
                  isSelected ? styles.tab.selected : styles.tab.notSelected,
                  isDisabled &&
                  'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-(--text-muted)',
                )
              }
            >
              {child.props.title}
            </Tab>
          );
        })}
      </TabList>

      {validChildren.map((child) => {
        const id = child.props.id ?? child.props.title;
        return (
          <TabPanel
            key={id}
            id={id}
            className={cn(
              styles.panel,
              'outline-none focus-visible:ring-2 focus-visible:ring-(--focus-ring)',
            )}
          >
            {child.props.children}
          </TabPanel>
        );
      })}
    </AriaTabs>
  );
};

const TabItem: React.FC<TabItemProps> = ({ children }) => <>{children}</>;
Tabs.Item = TabItem;
