import { Meta } from '@storybook/react-vite';
import React, { useState } from 'react';
import { expect, screen } from 'storybook/test';

import { Button } from '../../core/Button';
import { ChevronLeft, ChevronRight } from '../../icons';
import { Drawer } from './Drawer';

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  parameters: {
    tags: ['autodocs'],
    docs: {
      description: {
        component:
          'A floating sheet that slides in from any of the four edges, detached from ' +
          'the screen edge (10px inset, 20px from `md:`) with a full radius, hairline ' +
          'border and soft shadow, over a `--scrim` backdrop. Left/right drawers are ' +
          'columns (viewport fraction by default, or a named `size` on the `Dialog` ' +
          'scale); top/bottom sheets center in a capped column and get a drag handle ' +
          'automatically — pull it past a third of the sheet (or flick) to dismiss. ' +
          'Compose with `Header` (which renders the close button in its ' +
          'row), `Eyebrow`, `Heading`, `Body` (the only part that scrolls) and `Footer`. ' +
          'For drill-in flows, stack a second drawer with `scrim={false}` and nudge the ' +
          'one underneath aside with `stackOffset` — see the StackedDrawers story.',
      },
    },
  },
};

export default meta;

/**
 * The full anatomy in one place: `Header` carries an `Eyebrow` and `Heading`
 * and renders the close button for you, `Body` is the only slot that scrolls,
 * and `Footer` holds right-aligned actions above a full-bleed divider. Start
 * from this shape and delete what a given panel doesn't need.
 */
const OpenDrawerComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <p>The drawer opens as a floating sheet over this page.</p>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Drawer.Header>
          <Drawer.Eyebrow>Field guide</Drawer.Eyebrow>
          <Drawer.Heading>Choosing a drawer</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>
            Reach for a drawer when the user needs the page as context while they work —
            filters beside results, details beside the list they came from. When the task
            should interrupt and demand an answer before anything else happens, that is a
            Dialog, not a drawer.
          </p>
          <p className="mt-3">
            Direction carries meaning too: navigation conventionally slides from the left,
            inspectors from the right, actions from the bottom and notifications from the top.
          </p>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="primary" onClick={() => setIsOpen(false)}>
            Got it
          </Button>
        </Drawer.Footer>
      </Drawer>
    </div>
  );
};

export const OpenDrawer = () => <OpenDrawerComponent />;

/**
 * The drawer is controlled: the page owns `isOpen` and hands the drawer an
 * `onClose`. There is no internal open state to get out of sync with — the
 * trigger button and the drawer read from the same `useState`.
 */
const ClosedDrawerComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <p>State lives out here on the page, not inside the drawer.</p>
      <button onClick={() => setIsOpen(true)}>Open Drawer</button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Drawer.Header>
          <Drawer.Heading>Controlled by the page</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>
            The button you clicked set <code>isOpen</code> to true; closing sets it back.
            Because the drawer never owns the state, opening it from a menu, a keyboard
            shortcut or a route change is the same one-line change.
          </p>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export const ClosedDrawer = () => <ClosedDrawerComponent />;

/**
 * `onClose` is a hook point, not just a state setter. Every dismissal route —
 * the close button, Escape, a click on the scrim, a drag on the handle — runs
 * this one callback, so cleanup like persisting a draft belongs there and
 * cannot be bypassed. Close the drawer any way you like and watch the page
 * count it.
 */
const DrawerWithActionsComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [drafts, setDrafts] = useState(0);

  const handleClose = () => {
    setDrafts(count => count + 1); // stands in for real cleanup: save the draft
    setIsOpen(false);
  };

  return (
    <div>
      <p>Draft saved {drafts} times — once per dismissal, whichever route closed it.</p>
      <button onClick={() => setIsOpen(true)}>Open Drawer</button>
      <Drawer isOpen={isOpen} onClose={handleClose}>
        <Drawer.Header>
          <Drawer.Heading>One way out</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>
            Try the X, Escape or the backdrop — the counter on the page increments either
            way, because all of them funnel through the same <code>onClose</code>.
          </p>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export const DrawerWithClose = () => <DrawerWithActionsComponent />;

/**
 * A sized inspector panel. `size="sm"` caps the drawer at a column (28rem)
 * instead of the default viewport fraction — the shape an activity log or a
 * detail panel wants, where the page behind it stays readable. The scale is
 * `Dialog`'s, so a panel is the same width whichever way it arrives. The
 * `Eyebrow` slot names the context the panel belongs to.
 */
const ActivityPanelComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const events = [
    { time: '09:12:04', text: 'Ship docked — scrolls seized for copying' },
    { time: '09:14:31', text: 'Registered Elements, Euclid — 13 volumes' },
    { time: '10:02:17', text: 'Measurement of the Earth catalogued' },
    { time: '10:40:59', text: 'Duplicate of Physics skipped' },
  ];

  return (
    <div>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open activity
      </button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} side="right" size="sm">
        <Drawer.Header>
          <Drawer.Eyebrow>Library of Alexandria</Drawer.Eyebrow>
          <Drawer.Heading>Activity</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <ul className="flex flex-col gap-3">
            {events.map(event => (
              <li key={event.time} className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-(--text-subtle)">{event.time}</span>
                <span className="text-sm text-(--text-muted)">{event.text}</span>
              </li>
            ))}
          </ul>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export const ActivityPanel = () => <ActivityPanelComponent />;
ActivityPanel.play = async () => {
  // The dialog is in a portal, outside canvasElement.
  const panel = await screen.findByRole('dialog');
  const width = panel.getBoundingClientRect().width;

  // Capped at 28rem — measured against the live root font size, since the
  // design system scales rem with the viewport (`--font-size-base` is a
  // clamp), so the cap is not a fixed pixel count.
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  expect(width).toBeLessThanOrEqual(28 * rem + 1);

  // And genuinely narrower than the responsive default would be here.
  expect(width).toBeLessThan(window.innerWidth * 0.58);

  expect(screen.getByText(/Euclid/)).toBeVisible();
};

/**
 * A bottom sheet — the action-sheet shape. On a phone it spans the width
 * (minus the inset); on wide screens it centers in a column, because a sheet
 * spanning the whole display reads as a strip, not a sheet. Vertical drawers
 * get the drag handle automatically. One full-width primary action in the
 * footer is the conventional mobile close.
 */
const BottomSheetComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const lines = [
    { label: 'Hands-on ultrasound', value: '€640' },
    { label: 'Course dinner', value: '€69' },
  ];

  return (
    <div>
      <button type="button" onClick={() => setIsOpen(true)}>
        Review order
      </button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} side="bottom">
        <Drawer.Header>
          <Drawer.Eyebrow>Step 2 of 3</Drawer.Eyebrow>
          <Drawer.Heading>Your registration</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          {lines.map(line => (
            <div
              key={line.label}
              className="flex justify-between border-b border-border-1 py-3 text-sm"
            >
              <span className="text-(--text-muted)">{line.label}</span>
              <span className="font-semibold">{line.value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 text-xl font-semibold">
            <span>Total</span>
            <span>€709</span>
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="primary" className="w-full" onClick={() => setIsOpen(false)}>
            Continue to payment
          </Button>
        </Drawer.Footer>
      </Drawer>
    </div>
  );
};

export const BottomSheet = () => <BottomSheetComponent />;

/** Back-link for a stacked sheet's header: carries the title of the sheet underneath. */
const BackLink = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-6 cursor-pointer items-center gap-1.5 self-start rounded-full text-sm font-semibold text-(--primary) hover:underline"
  >
    <ChevronLeft size={16} />
    {children}
  </button>
);

/** Drill-in row: opens the next sheet in the stack. */
const DrillInButton = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl border border-border-2 px-3.5 text-sm font-semibold hover:bg-overlay-hover"
  >
    {children}
    <ChevronRight size={18} />
  </button>
);

/**
 * Three stacked levels, one scrim. Each deeper drawer opens with
 * `scrim={false}` — a scrim per level would just darken the page step by
 * step — and the sheets underneath pass `stackOffset` (how many sheets sit
 * above them) so they nudge aside and stay visible as a pile. From level two
 * the header leads with a back-link carrying the title of the sheet
 * underneath, instead of only an X.
 *
 * The content drills the way the pattern is meant to: overview → detail →
 * source. Here it walks from Ada Lovelace into her 1843 notes on Babbage's
 * Analytical Engine, down to Note G — the first published program.
 */
const StackedDrawersComponent: React.FC = () => {
  const [adaOpen, setAdaOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteGOpen, setNoteGOpen] = useState(false);

  const closeAll = () => {
    setNoteGOpen(false);
    setNotesOpen(false);
    setAdaOpen(false);
  };

  return (
    <div>
      <button type="button" onClick={() => setAdaOpen(true)}>
        Open Ada Lovelace
      </button>

      <Drawer
        isOpen={adaOpen}
        onClose={closeAll}
        side="right"
        size="sm"
        stackOffset={(notesOpen ? 1 : 0) + (noteGOpen ? 1 : 0)}
      >
        <Drawer.Header>
          <Drawer.Eyebrow>The first programmer</Drawer.Eyebrow>
          <Drawer.Heading>Ada Lovelace</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold tracking-wide text-(--text-subtle) uppercase">
              Lived
            </span>
            <span className="text-sm">1815–1852 · London</span>
          </div>
          <p className="text-sm text-(--text-muted)">
            Mathematician. Annotated the Analytical Engine — Charles Babbage&apos;s design for a
            general-purpose computer — and in doing so wrote what is regarded as the first
            published program, a century before such a machine was built.
          </p>
          <DrillInButton onClick={() => setNotesOpen(true)}>
            Notes on the Analytical Engine
          </DrillInButton>
        </Drawer.Body>
      </Drawer>

      <Drawer
        isOpen={notesOpen}
        onClose={() => {
          setNoteGOpen(false);
          setNotesOpen(false);
        }}
        side="right"
        size="sm"
        scrim={false}
        stackOffset={noteGOpen ? 1 : 0}
      >
        <Drawer.Header>
          <BackLink onClick={() => setNotesOpen(false)}>Ada Lovelace</BackLink>
          <Drawer.Heading>Notes on the Analytical Engine</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-3.5">
          {[
            { time: '1833', text: 'Meets Charles Babbage and sees his Difference Engine' },
            {
              time: '1837',
              text: 'Babbage describes the Analytical Engine: a mill, a store, and punched cards borrowed from the Jacquard loom',
            },
            { time: '1842', text: 'Menabrea publishes a French account of the engine' },
            {
              time: '1843',
              text: 'Lovelace translates it — her own notes, signed A.A.L., triple its length',
            },
          ].map(entry => (
            <div key={entry.time} className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-(--text-subtle)">{entry.time}</span>
              <span className="text-sm text-(--text-muted)">{entry.text}</span>
            </div>
          ))}
          <DrillInButton onClick={() => setNoteGOpen(true)}>
            Note G · the first program
          </DrillInButton>
        </Drawer.Body>
      </Drawer>

      <Drawer
        isOpen={noteGOpen}
        onClose={() => setNoteGOpen(false)}
        side="right"
        size="sm"
        scrim={false}
      >
        <Drawer.Header>
          <BackLink onClick={() => setNoteGOpen(false)}>Notes on the Analytical Engine</BackLink>
          <Drawer.Heading>Note G</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p className="text-sm text-(--text-muted)">
            Note G walks the engine step by numbered step through computing a Bernoulli number,
            operations acting on stored variables — a program, published in 1843 for a machine
            that was never completed. It ran only on paper.
          </p>
          <p className="mt-3 text-sm text-(--text-muted)">
            Her notes also saw past arithmetic: the engine &ldquo;weaves algebraic patterns just
            as the Jacquard-loom weaves flowers and leaves&rdquo;, and given rules of harmony it
            might compose music. Symbols, not just numbers — the idea that makes it a computer.
          </p>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export const StackedDrawers = () => <StackedDrawersComponent />;
