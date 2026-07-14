// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar } from './Navbar';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Menu } from '../Menu';
import { NavTree } from '../NavTree';
import { SearchField } from '../../forms/SearchField';
import { Database, LayoutGrid, ScrollText, Search } from '../../icons';

const meta: Meta<typeof Navbar> = {
  title: 'Core/Navbar',
  component: Navbar,
  tags: ['autodocs'],
  parameters: {
    noPadding: true,
  },
};
export default meta;
type Story = StoryObj<typeof Navbar>;

const mark = (
  <span
    aria-hidden
    className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--primary) font-serif text-base font-bold text-(--text-on-primary)"
  >
    A
  </span>
);

/**
 * The whole library folds into your pocket — antiquity's version was the
 * capsa, the traveling scroll case. `Navbar.Toggle` (a burger that morphs
 * into an X in place) pairs with `Navbar.Collapse` (the panel under the
 * bar); `aria-expanded`/`aria-controls` are wired for you — no state, no
 * ids. Two independent pairs here: the search toggle (`controls="search"`)
 * and the burger (default `"menu"`) — opening one closes the other. Shrink
 * the viewport to see the stages (search needs `lg`, links `md`).
 */
export const PocketLibrary: Story = {
  render: () => (
    <Navbar sticky elevated fluid>
      <Navbar.Brand>
        <a href="#" className="flex items-center gap-2.5 no-underline">
          {mark}
          <span className="font-serif text-lg font-bold tracking-tight">Alexandria</span>
        </a>
      </Navbar.Brand>
      <Navbar.Links className="ml-2 hidden md:flex">
        <Navbar.Link href="#dashboard" isCurrent>
          Dashboard
        </Navbar.Link>
        <Navbar.Link href="#manuscripts">Manuscripts</Navbar.Link>
      </Navbar.Links>
      <Navbar.Search className="hidden justify-center lg:flex">
        <SearchField size="sm" placeholder="Search…" aria-label="Search" />
      </Navbar.Search>
      <Navbar.Spacer className="lg:hidden" />
      <Navbar.Actions>
        <Navbar.Toggle controls="search" ariaLabel="Search" className="lg:hidden">
          <Search size={16} />
        </Navbar.Toggle>
        <Navbar.Toggle className="md:hidden" />
      </Navbar.Actions>

      <Navbar.Collapse id="search" className="lg:hidden">
        <SearchField size="sm" placeholder="Search…" aria-label="Search" />
      </Navbar.Collapse>

      <Navbar.Collapse className="md:hidden">
        <NavTree
          aria-label="Menu"
          currentPath="#dashboard"
          items={[
            { title: 'Dashboard', href: '#dashboard', icon: <LayoutGrid size={18} /> },
            { title: 'Manuscripts', href: '#manuscripts', icon: <ScrollText size={18} /> },
            { title: 'Catalogue', href: '#catalogue', icon: <Database size={18} /> },
          ]}
        />
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="primary" block>
            Become a member
          </Button>
        </div>
      </Navbar.Collapse>
    </Navbar>
  ),
};

/**
 * The console header: brand, pill links with the current page tinted, a
 * `SearchField` in the `Navbar.Search` slot (a slot because `forms/` can't
 * be imported from `core/`), and the user menu. The librarian on duty is
 * Hypatia. Staged collapse: the inline search needs `lg` — below that a
 * search toggle folds the field out under the bar; links need `md`. For the
 * burger pattern, see the PocketLibrary story.
 */
export const ConsoleHeader: Story = {
  render: () => (
    <Navbar sticky elevated fluid>
      <Navbar.Brand>
        <a href="#" className="flex items-center gap-2.5 no-underline">
          {mark}
          <span className="font-serif text-lg font-bold tracking-tight">Alexandria</span>
        </a>
      </Navbar.Brand>

      <Navbar.Links className="ml-2 hidden md:flex">
        <Navbar.Link href="#dashboard" isCurrent>
          Dashboard
        </Navbar.Link>
        <Navbar.Link href="#manuscripts">Manuscripts</Navbar.Link>
        <Navbar.Link href="#catalogue">Catalogue</Navbar.Link>
      </Navbar.Links>

      <Navbar.Search className="hidden justify-center lg:flex">
        <SearchField
          size="sm"
          placeholder="Search 400,000 scrolls…"
          aria-label="Search the archive"
        />
      </Navbar.Search>

      {/* Below lg the search zone is hidden, so this keeps the menu right. */}
      <Navbar.Spacer className="lg:hidden" />

      <Navbar.Actions>
        {/* Below lg the inline search is hidden — this toggle folds a search
            panel out under the bar instead (custom icon, no burger morph). */}
        <Navbar.Toggle controls="search" className="lg:hidden" ariaLabel="Search">
          <Search size={16} />
        </Navbar.Toggle>
        <Menu>
          <Menu.Trigger className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-1 bg-card py-1 pl-1 pr-2.5">
            <Avatar name="Hypatia" size="sm" />
            <span className="text-sm font-semibold">Hypatia</span>
            <Menu.Chevron className="h-5 w-5" />
          </Menu.Trigger>
          <Menu.Header>
            <Avatar name="Hypatia" size="lg" />
            <Menu.Header.Name>Hypatia of Alexandria</Menu.Header.Name>
            <Menu.Header.Email>hypatia@museion.alexandria</Menu.Header.Email>
          </Menu.Header>
          <Menu.Button id="logout" onClick={() => console.log('logout')}>
            Log out
          </Menu.Button>
        </Menu>
      </Navbar.Actions>

      <Navbar.Collapse id="search" className="lg:hidden">
        <SearchField
          size="sm"
          placeholder="Search 400,000 scrolls…"
          aria-label="Search the archive"
        />
      </Navbar.Collapse>
    </Navbar>
  ),
};

/**
 * The marketing variant: centered `container` width, links and a call to
 * action on the right — links hide below `md`, the CTA stays. The Museion —
 * the "shrine of the Muses" that housed the library — did in fact recruit
 * scholars with free lodging and meals.
 */
export const MarketingHeader: Story = {
  render: () => (
    <Navbar elevated>
      <Navbar.Brand>
        <a href="#" className="flex items-center gap-2.5 no-underline">
          {mark}
          <span className="font-serif text-lg font-bold tracking-tight">Museion</span>
        </a>
      </Navbar.Brand>
      <Navbar.Spacer />
      <Navbar.Links className="hidden md:flex">
        <Navbar.Link href="#collections">Collections</Navbar.Link>
        <Navbar.Link href="#scholars" isCurrent>
          Scholars
        </Navbar.Link>
        <Navbar.Link href="#lectures">Lectures</Navbar.Link>
      </Navbar.Links>
      <Button variant="primary" size="sm">
        Join the Museion
      </Button>
    </Navbar>
  ),
};

/**
 * The designer's "editorial split": an `elevated` floating card stacked from
 * `Navbar.Row`s — a utility strip (tinted background, no borders anywhere),
 * the brand row with search and CTA, and a horizontally scrollable nav row.
 * Rows are separated by background tone only: "baren står på en subtil
 * skygge". On small screens the card goes full-bleed, edge to edge.
 */
export const EditorialSplit: Story = {
  render: () => (
    <div className="bg-(--surface) py-6 md:p-6">
      <Navbar elevated>
        <Navbar.Row variant="utility">
          <span className="min-w-0 truncate font-serif italic">
            Lecture tonight: Hypatia on the conics of Apollonius
          </span>
          <span className="flex shrink-0 items-center gap-3 whitespace-nowrap">
            <span className="hidden sm:inline">NO · EN</span>
            <a href="#visit" className="text-(--accent) underline underline-offset-2">
              Plan your visit
            </a>
          </span>
        </Navbar.Row>
        <Navbar.Row variant="brand">
          <Navbar.Brand>
            <a href="#" className="flex items-center gap-2.5 no-underline">
              {mark}
              <span>
                <span className="block font-serif text-lg font-bold leading-none tracking-tight">
                  Museion
                </span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-subtle)">
                  Library · est. 285 BCE
                </span>
              </span>
            </a>
          </Navbar.Brand>
          <span className="flex shrink-0 items-center gap-3">
            <span className="hidden md:block">
              <SearchField
                size="sm"
                placeholder="Search scrolls, scholars…"
                aria-label="Search the library"
              />
            </span>
            <Button variant="primary" size="sm">
              Become a member
            </Button>
          </span>
        </Navbar.Row>
        <Navbar.Row variant="nav" className="overflow-x-auto pb-2">
          <Navbar.Links className="flex-nowrap">
            <Navbar.Link href="#collections" isCurrent className="whitespace-nowrap">
              Collections
            </Navbar.Link>
            <Navbar.Link href="#scholars" className="whitespace-nowrap">
              Scholars
            </Navbar.Link>
            <Navbar.Link href="#lectures" className="whitespace-nowrap">
              Lectures
            </Navbar.Link>
            <Navbar.Link href="#visit" className="whitespace-nowrap">
              Visit
            </Navbar.Link>
          </Navbar.Links>
        </Navbar.Row>
      </Navbar>
    </div>
  ),
};

/**
 * `overlay` + `glass` float a translucent navbar over a hero — here the
 * night sky Hypatia lectured on. The nav scrolls away with the page
 * (unlike `sticky`, which stays pinned).
 */
export const OverlayGlass: Story = {
  render: () => (
    <div className="relative">
      <Navbar overlay glass dark>
        <Navbar.Brand>
          <span className="font-serif text-lg font-bold tracking-tight">Observatory</span>
        </Navbar.Brand>
        <Navbar.Spacer />
        <Navbar.Links>
          <Navbar.Link href="#sky" isCurrent className="text-(--text)">
            Tonight&apos;s sky
          </Navbar.Link>
          <Navbar.Link href="#almagest" className="text-(--text)">
            Almagest
          </Navbar.Link>
        </Navbar.Links>
      </Navbar>
      <div className="flex h-64 items-end bg-linear-to-b from-primary-950 to-primary-800 p-6">
        <p className="max-w-[44ch] font-serif text-xl text-secondary-200">
          &ldquo;Reserve your right to think, for even to think wrongly is better
          than not to think at all.&rdquo; — attributed to Hypatia
        </p>
      </div>
    </div>
  ),
};
