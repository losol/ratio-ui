import { Meta } from '@storybook/react-vite';
import React, { useState } from 'react';
import { expect, screen } from 'storybook/test';

import { Drawer } from './Drawer';

const getRandomHipsterIpsum = () => {
  const hipsterIpsums = [
    'Pabst semiotics distillery bicycle rights forage. Art party crucifix poutine vinyl.',
    'Vexillologist ramps chambray meditation. Ethical air plant keytar brooklyn.',
    'Chia mumblecore hoodie umami fanny pack quinoa sriracha. Gastropub truffaut etsy succulents.',
    'Bespoke kinfolk food truck yuccie seitan. Tofu taxidermy quinoa microdosing prism.',
  ];
  const randomIndex = Math.floor(Math.random() * hipsterIpsums.length);
  return hipsterIpsums[randomIndex];
};

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  parameters: {
    tags: ['autodocs'],
  },
};

export default meta;

const OpenDrawerComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <p>{getRandomHipsterIpsum()}</p>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Drawer.Header>
          <Drawer.Heading>Drawer Header</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>{getRandomHipsterIpsum()}</p>
        </Drawer.Body>
        <Drawer.Footer>Drawer Footer</Drawer.Footer>
      </Drawer>
    </div>
  );
};

export const OpenDrawer = () => <OpenDrawerComponent />;

const ClosedDrawerComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <p>This is some content before the drawer.</p>
      <button onClick={() => setIsOpen(true)}>Open Drawer</button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Drawer.Header>
          <Drawer.Heading>Drawer Header sample</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>{getRandomHipsterIpsum()}</p>
        </Drawer.Body>
        <Drawer.Footer>Drawer Footer</Drawer.Footer>
      </Drawer>
    </div>
  );
};

export const ClosedDrawer = () => <ClosedDrawerComponent />;

const DrawerWithActionsComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    alert('Close action triggered!');
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Drawer</button>
      <Drawer isOpen={isOpen} onClose={handleClose}>
        <Drawer.Header>
          <Drawer.Heading>Drawer With Close</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>
          <p>{getRandomHipsterIpsum()}</p>
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
 * `Dialog`'s, so a panel is the same width whichever way it arrives.
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
        <Drawer.Header as="h2">Activity</Drawer.Header>
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
