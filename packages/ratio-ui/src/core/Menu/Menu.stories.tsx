import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { Meta, StoryFn } from '@storybook/react-vite';
import Menu, { MenuProps } from './Menu';
import { Avatar } from '../Avatar';
import { fn } from 'storybook/test';
import { AlertTriangle, BookOpen, Copy, Eye, LogOut, Mail, ScrollText } from '../../icons';

const meta: Meta<typeof Menu> = {
  component: Menu,
  tags: ['autodocs'],
};

export default meta;

type MenuStory = StoryFn<MenuProps>;

/**
 * The default trigger with plain text links (no icons — they're optional):
 * the corpus of Aristotle, in the order a student at the Lyceum would have
 * met it — logic first, then nature, then what comes after nature. `isCurrent`
 * draws the accent bar on the active row.
 */
export const Playground: MenuStory = () => (
  <Menu>
    <Menu.Trigger>
      Aristotle
      <Menu.Chevron />
    </Menu.Trigger>
    <Menu.Link href="#organon">Organon — the toolkit of logic</Menu.Link>
    <Menu.Link href="#physics" isCurrent>
      Physics — on nature and change
    </Menu.Link>
    <Menu.Link href="#metaphysics">Metaphysics — “after the Physics”</Menu.Link>
    <Menu.Link href="#ethics">Nicomachean Ethics — on the good life</Menu.Link>
  </Menu>
);

/**
 * The full user-menu, everything at once: custom avatar-pill trigger,
 * identity `Menu.Header`, personal links (with `isCurrent` on the page
 * you're on), a single-select "view as", a language picker that stays open
 * while comparing (`shouldCloseOnSelect={false}`, with Demotic disabled —
 * by 400 CE few scribes could still write it), a **multi-select**
 * notification section, theme toggle, and a danger log-out behind a
 * separator. `maxHeight={480}` caps the popover so the list scrolls under
 * the pinned identity header (without it, the menu caps itself to the
 * viewport).
 *
 * The scholar is Hypatia of Alexandria (c. 400 CE): she wrote commentaries
 * on Diophantus and Apollonius, and her student Synesius — whose letters to
 * her survive — credits her help designing an astrolabe.
 */
export const UserMenu: MenuStory = () => {
  const [role, setRole] = useState<Selection>(new Set(['curator']));
  const [language, setLanguage] = useState<Selection>(new Set(['greek']));
  const [notify, setNotify] = useState<Selection>(new Set(['acquisitions', 'letters']));
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <div className="flex justify-end">
      <Menu onOpenChange={fn()} maxHeight={480}>
        <Menu.Trigger className="inline-flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full border border-border-2 bg-card text-(--text) hover:border-(--primary) focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-(--focus-ring) transition-all">
          <Avatar name="Hypatia" size="sm" />
          <span className="text-sm">hypatia@museion.alexandria</span>
          <Menu.Chevron className="ml-0 h-3.5 w-3.5 text-(--text-muted)" />
        </Menu.Trigger>

        <Menu.Header>
          <Avatar name="Hypatia" size="lg" />
          <Menu.Header.Name>Hypatia of Alexandria</Menu.Header.Name>
          <Menu.Header.Email>hypatia@museion.alexandria</Menu.Header.Email>
          <Menu.Header.Role>Curator</Menu.Header.Role>
        </Menu.Header>

        <Menu.Section label="Workspace">
          <Menu.Link href="#commentaries" icon={<ScrollText />} isCurrent>
            My commentaries
          </Menu.Link>
          <Menu.Link href="#correspondence" icon={<Mail />}>
            Correspondence
          </Menu.Link>
        </Menu.Section>

        <Menu.Section
          label="View as"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={role}
          onSelectionChange={setRole}
        >
          <Menu.Option id="curator">Curator</Menu.Option>
          <Menu.Option id="scholar">Visiting scholar</Menu.Option>
        </Menu.Section>

        <Menu.Section
          label="Manuscript language"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={language}
          onSelectionChange={setLanguage}
          shouldCloseOnSelect={false}
        >
          <Menu.Option id="greek">Ancient Greek</Menu.Option>
          <Menu.Option id="latin">Latin</Menu.Option>
          <Menu.Option id="coptic">Coptic</Menu.Option>
          <Menu.Option id="demotic" isDisabled textValue="Demotic">
            Demotic (few scribes remain)
          </Menu.Option>
        </Menu.Section>

        <Menu.Section
          label="Notify me about"
          selectionMode="multiple"
          selectedKeys={notify}
          onSelectionChange={setNotify}
          shouldCloseOnSelect={false}
        >
          <Menu.Option id="acquisitions">New acquisitions</Menu.Option>
          <Menu.Option id="letters">Letters from Synesius</Menu.Option>
          <Menu.Option id="astrolabe">Astrolabe workshop</Menu.Option>
        </Menu.Section>

        <Menu.ThemeToggle theme={theme} onThemeChange={setTheme} />

        <Menu.Separator />

        <Menu.Button id="logout" onClick={fn()} icon={<LogOut />} variant="danger">
          Log out
        </Menu.Button>
      </Menu>
    </div>
  );
};

/**
 * Links and actions mixed, with a disabled item: the Library of Alexandria
 * lent nothing — Ptolemy III famously borrowed Athens' official copies of the
 * tragedians, kept the originals, and returned copies (forfeiting the
 * deposit). Requesting a copy is how you "borrowed".
 */
export const ManuscriptActions: MenuStory = () => (
  <Menu>
    <Menu.Trigger>
      Almagest — Ptolemy
      <Menu.Chevron />
    </Menu.Trigger>
    <Menu.Link href="#read" icon={<Eye />}>Read in the great hall</Menu.Link>
    <Menu.Button id="request-copy" onClick={fn()} icon={<Copy />}>
      Request a scribal copy
    </Menu.Button>
    <Menu.Link href="#borrow" icon={<BookOpen />} isDisabled>
      Borrow the original (originals never leave)
    </Menu.Link>
    <Menu.Separator />
    <Menu.Button id="report" onClick={fn()} icon={<AlertTriangle />} variant="danger">
      Report damaged scroll
    </Menu.Button>
  </Menu>
);
