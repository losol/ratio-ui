// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar } from '.';
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
    <div className="bg-surface py-6 md:p-6">
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
 * `sticky` + `glass` pins a frosted bar: the page surface at 88% with a
 * backdrop blur, so what scrolls under it still shows through — fitting,
 * for a page about a text read through the one written over it. The
 * Archimedes Palimpsest is a 10th-century copy of Archimedes scraped and
 * overwritten with prayers in the 13th; multispectral imaging (1998–2008)
 * read the under-text back, including the only surviving copy of *The
 * Method*. `aria-label` names the landmark, as any nav prop now passes
 * through to the root.
 */
export const StickyGlass: Story = {
  render: () => (
    <div>
      <Navbar sticky glass aria-label="Site">
        <Navbar.Brand>
          <span className="font-serif text-lg font-bold tracking-tight">Palimpsest</span>
        </Navbar.Brand>
        <Navbar.Spacer />
        <Navbar.Links>
          <Navbar.Link href="#under-text" aria-current="location">
            Under-text
          </Navbar.Link>
          <Navbar.Link href="#over-text">Over-text</Navbar.Link>
          <Navbar.Link href="#provenance">Provenance</Navbar.Link>
          <Navbar.Link href="#imaging">Imaging</Navbar.Link>
        </Navbar.Links>
        <Navbar.Actions>
          <Menu>
            <Menu.Trigger className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-1 bg-card py-1 pl-1 pr-2.5">
              <Avatar name="Reviel Netz" size="sm" />
              <Menu.Chevron className="h-5 w-5" />
            </Menu.Trigger>
            <Menu.Header>
              <Avatar name="Reviel Netz" size="lg" />
              <Menu.Header.Name>Reviel Netz</Menu.Header.Name>
              <Menu.Header.Email>netz@palimpsest.org</Menu.Header.Email>
            </Menu.Header>
            <Menu.Link href="#folios">Your folios</Menu.Link>
            <Menu.Button id="logout" onClick={() => {}}>
              Log out
            </Menu.Button>
          </Menu>
        </Navbar.Actions>
      </Navbar>
      <div className="container mx-auto px-4">
        <section id="under-text">
          <h2>Under-text</h2>
          <p>
            Seven treatises by Archimedes, copied in Constantinople around 950: among them
            <em> The Method of Mechanical Theorems</em>, in which he explains how he found
            results by weighing shapes against each other before proving them — the working,
            not just the proof.
          </p>
          <p>
            No other copy of <em>The Method</em> survives. Everything we know of how Archimedes
            actually thought comes through this one, scraped-off text.
          </p>
        </section>
        <section id="over-text">
          <h2>Over-text</h2>
          <p>
            In 1229 the parchment was washed, cut, folded and rebound as a prayer book. The
            scribe was not destroying Archimedes; he was reusing expensive material for a text
            he needed. Reuse was how most parchment survived at all.
          </p>
        </section>
        <section id="provenance">
          <h2>Provenance</h2>
          <p>
            The book surfaced in a Constantinople library catalogue in 1846, was read and
            photographed by Johan Ludvig Heiberg in 1906, then vanished for most of a century —
            long enough to acquire forged gold-leaf portraits painted over four of its pages by
            someone hoping to raise the price.
          </p>
          <p>
            It reappeared at auction in 1998, sold to a private buyer, and was deposited at the
            Walters Art Museum in Baltimore the same year. Conservation took a decade: the
            forgeries had to come off, the mould had to be stabilised, and the binding had to be
            taken apart leaf by leaf before anything could be photographed flat.
          </p>
        </section>
        <section id="imaging">
          <h2>Imaging</h2>
          <p>
            Between 1998 and 2008 the pages were photographed under a dozen wavelengths and the
            faint iron-gall traces of the under-text separated from the over-text — and, on the
            worst pages, teased out with synchrotron X-ray fluorescence. Every image was
            published under an open licence.
          </p>
        </section>
      </div>
    </div>
  ),
};

/**
 * `overlay` + `glass dark` float a frosted, dark navbar over a hero — here
 * the night sky Hypatia lectured on. The nav scrolls away with the page
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

// ── Occasions ────────────────────────────────────────────────────────────
// The same bar on a different day. An occasion is set once by the app
// (`<html data-occasion="…">`), which styles the stable hook classes
// (`ratio-navbar`, `ratio-navbar__brand`, …) and passes the slot props from
// its occasion config — see docs/occasions.md. Here the palette comes in as
// `bgColor` + `dark`, which is what such a rule amounts to.

const athenaeum = (
  <>
    <Navbar.Brand>
      <span className="font-serif text-lg font-bold tracking-tight">Athenaeum</span>
    </Navbar.Brand>
    <Navbar.Links>
      <Navbar.Link href="#" isCurrent>
        Lectures
      </Navbar.Link>
      <Navbar.Link href="#">Library</Navbar.Link>
      <Navbar.Link href="#">Visit</Navbar.Link>
    </Navbar.Links>
    <Navbar.Spacer />
  </>
);

// A motif is one silhouette in one colour, drawn in currentColor — here a
// comet for the December lecture series, 3:1 like the board asks. Real
// occasions ship their own SVG (a sleigh, a flag at half mast); the slot
// only sizes and places it.
const winterSky = (
  <svg viewBox="0 0 96 32" fill="currentColor"><path d="M0 30 C 24 22, 50 15, 74 10 L 76 15 C 52 20, 26 26, 0 30 Z" opacity=".6" /><polygon points="80.0,1.0 82.7,8.3 90.5,8.6 84.4,13.4 86.5,20.9 80.0,16.6 73.5,20.9 75.6,13.4 69.5,8.6 77.3,8.3" /></svg>
);

/**
 * `Navbar.Motif` is the motif slot at the bar's right edge: 32px tall, the
 * width follows the SVG, hidden below 880px (widen the canvas if you don't
 * see it), `aria-hidden`. Still by
 * default — the base level that works for every occasion. With `entry` the
 * motif slides 16px in from the right once on page load (700 ms, the
 * buttons' easing) and then stays put: never a loop, off under
 * `prefers-reduced-motion` and `data-motion="none"`. The bar itself is the
 * app's seasonal palette via `bgColor` + `dark` — colour and text, never
 * layout.
 */
export const OccasionMotif: Story = {
  render: () => (
    <div className="space-y-6">
      <Navbar bgColor="bg-[#22463C]" dark aria-label="Site — still motif">
        {athenaeum}
        <Navbar.Motif className="text-accent-300">{winterSky}</Navbar.Motif>
        <Navbar.Actions>
          <Button variant="primary" size="sm">
            Sign in
          </Button>
        </Navbar.Actions>
      </Navbar>
      <Navbar bgColor="bg-[#22463C]" dark aria-label="Site — motif with entry">
        {athenaeum}
        <Navbar.Motif entry className="text-accent-300">
          {winterSky}
        </Navbar.Motif>
        <Navbar.Actions>
          <Button variant="primary" size="sm">
            Sign in
          </Button>
        </Navbar.Actions>
      </Navbar>
    </div>
  ),
};

/**
 * `wash` paints one soft zone per colour behind the bar, side by side and
 * blended into the surface — `multiply` on a light bar, `screen` on a dark
 * one — so the bar's text stays readable over each — the
 * occasion slot for flag colours. Six zones for a pride week, three for a
 * national day; the app owns the list, and must check AA contrast of the
 * bar text over every colour it passes.
 */
export const OccasionWash: Story = {
  render: () => (
    <div className="space-y-6">
      <Navbar
        bgColor="bg-surface"
        wash={['#E4322B', '#F08A1D', '#F5C93B', '#3E9B54', '#2C5FA8', '#7A4A9E']}
        aria-label="Site — six colours"
      >
        {athenaeum}
      </Navbar>
      <Navbar bgColor="bg-surface" wash={['#E4322B', '#F5C93B', '#2C5FA8']} aria-label="Site — three colours">
        {athenaeum}
      </Navbar>
    </div>
  ),
};

/**
 * Mourning is the quietest occasion and needs no new element: the bar
 * switches tone — ink surface, light text via `dark` — and everything else
 * stays put. It is the one occasion where stillness is the device, so the
 * app sets `data-motion="none"` on `<html>` (any ancestor works, as the
 * wrapper here shows) and every animation and transition beneath it stops,
 * including a motif's `entry`. An `Announcement` above the bar carries the
 * words, if there are any.
 */
export const OccasionMourning: Story = {
  render: () => (
    <div data-motion="none">
      <Navbar sticky bgColor="bg-primary-950" dark aria-label="Site">
        {athenaeum}
        <Navbar.Actions>
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Navbar.Actions>
      </Navbar>
      <div className="container mx-auto px-4 pt-10">
        <h2>Condolence book</h2>
        <p>
          The reading room is open for signatures this week. Lectures go ahead as planned; the
          evening programme is paused until Monday.
        </p>
      </div>
    </div>
  ),
};
