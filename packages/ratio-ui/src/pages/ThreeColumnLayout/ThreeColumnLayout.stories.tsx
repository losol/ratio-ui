import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { ThreeColumnLayout, ThreeColumnLayoutProps } from './ThreeColumnLayout';
import { NavTree, NavTreeItem } from '../../core/NavTree';
import { TableOfContents, TocHeading } from '../../core/TableOfContents/TableOfContents';

// The demo is itself a small lesson: how knowledge learned to travel — from
// hand-copied scrolls to open access. Sidebar, article, and TOC all walk the
// same timeline.

const sidebarTree: NavTreeItem[] = [
  { title: 'Overview', href: '#' },
  {
    title: 'The manuscript age',
    children: [
      { title: 'The Library of Alexandria', href: '#alexandria' },
      { title: 'Scriptoria', href: '#scriptoria' },
    ],
  },
  {
    title: 'The printing revolution',
    children: [
      { title: 'Gutenberg', href: '#gutenberg' },
      { title: 'What print changed', href: '#what-print-changed' },
    ],
  },
  {
    title: 'Scholarly exchange',
    children: [
      { title: 'The Republic of Letters', href: '#republic-of-letters' },
      { title: 'Scientific journals', href: '#journals' },
    ],
  },
  {
    title: 'Public knowledge',
    children: [
      { title: 'The Encyclopédie', href: '#encyclopedie' },
      { title: 'Public libraries', href: '#libraries' },
    ],
  },
  { title: 'The open era', href: '#open-access' },
];

const tocHeadings: TocHeading[] = [
  { id: 'alexandria', text: 'The Library of Alexandria', level: 2 },
  { id: 'scriptoria', text: 'Scriptoria', level: 2 },
  { id: 'gutenberg', text: 'Gutenberg', level: 2 },
  { id: 'what-print-changed', text: 'What print changed', level: 2 },
  { id: 'republic-of-letters', text: 'The Republic of Letters', level: 2 },
  { id: 'journals', text: 'Scientific journals', level: 2 },
  { id: 'peer-review', text: 'The roots of peer review', level: 3 },
  { id: 'encyclopedie', text: 'The Encyclopédie', level: 2 },
  { id: 'libraries', text: 'Public libraries', level: 2 },
  { id: 'open-access', text: 'The open era', level: 2 },
];

const StoryLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a href={href} className={className} onClick={(e) => { e.preventDefault(); console.log('navigate', href); }}>
    {children}
  </a>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="my-4 overflow-x-auto rounded-lg border border-border-1 bg-card p-4 text-sm">
    <code>{children}</code>
  </pre>
);

const SampleContent = () => (
  <article className="prose">
    <h1>How knowledge learned to travel</h1>
    <p className="text-lg text-(--text-muted)">
      Every idea you can look up tonight rode here on twenty-three centuries of
      infrastructure: libraries, scriptoria, presses, letters, journals, and
      open archives.
    </p>

    <h2 id="alexandria">The Library of Alexandria</h2>
    <p>
      Founded around 285 BCE, the Library of Alexandria attempted something new:
      collecting <em>all</em> written knowledge in one place. Ships docking in
      the harbour had their scrolls seized and copied. Callimachus&apos;s{' '}
      <em>Pinakes</em> — 120 scroll-cases of author, title, and subject — is the
      earliest library catalogue we know of: knowledge about where knowledge is.
    </p>

    <h2 id="scriptoria">Scriptoria</h2>
    <p>
      For the next thousand years, texts survived by being copied by hand. A
      single manuscript could take a scribe months, and every copy drifted a
      little from its source — which is why textual scholars still compare
      manuscript families today. Slow, expensive copying meant knowledge
      concentrated where the copyists were.
    </p>

    <h2 id="gutenberg">Gutenberg</h2>
    <p>
      Around 1440, Johannes Gutenberg combined movable metal type, oil-based
      ink, and a screw press. By 1500 — a single lifetime — European presses had
      produced an estimated twenty million volumes, more than all the scribes of
      the previous millennium. The unit cost of a page collapsed, and with it
      the monopoly on reading.
    </p>

    <h2 id="what-print-changed">What print changed</h2>
    <p>
      Print did more than multiply copies. Identical copies made{' '}
      <em>page numbers, indexes, and errata</em> meaningful — you could cite an
      exact passage and correct a specific error. Standardised diagrams could be
      trusted. The citation, the cornerstone of scholarship, is a child of the
      press.
    </p>

    <h2 id="republic-of-letters">The Republic of Letters</h2>
    <p>
      In the seventeenth century, scholars wove a continent-wide web of
      correspondence. Marin Mersenne forwarded so many results between Descartes,
      Fermat, Galileo and others that he was called{' '}
      <em>the post office of Europe</em>. A letter to Mersenne was, in effect, a
      publication.
    </p>

    <h2 id="journals">Scientific journals</h2>
    <p>
      In 1665 the letter grew a spine. The <em>Journal des sçavans</em> appeared
      in Paris in January; two months later Henry Oldenburg, secretary of the
      Royal Society, launched <em>Philosophical Transactions</em> — still
      published today, the world&apos;s oldest scientific journal. Structured
      metadata about published knowledge is older than you&apos;d think:
    </p>
    <CodeBlock>{`{
  "title": "Philosophical Transactions",
  "founded": 1665,
  "editor": "Henry Oldenburg",
  "publisher": "Royal Society of London",
  "innovations": ["registration", "archiving", "dissemination", "review"]
}`}</CodeBlock>

    <h3 id="peer-review">The roots of peer review</h3>
    <p>
      Oldenburg sent submitted manuscripts to knowledgeable members before
      printing them — registration, certification, and dissemination in one
      workflow. Three and a half centuries later, journals still run on his
      four functions.
    </p>

    <h2 id="encyclopedie">The Encyclopédie</h2>
    <p>
      Between 1751 and 1772, Diderot and d&apos;Alembert published twenty-eight
      volumes and roughly 74,000 articles, aiming — in Diderot&apos;s words — to
      &quot;change the common way of thinking&quot;. It was knowledge organised
      for citizens rather than scholars, complete with cross-references: links,
      two centuries before hypertext.
    </p>

    <h2 id="libraries">Public libraries</h2>
    <p>
      The nineteenth century turned reading into public infrastructure. Between
      1883 and 1929, Carnegie grants alone built more than 2,500 libraries
      worldwide. The radical idea: access to knowledge should not depend on
      owning it.
    </p>

    <h2 id="open-access">The open era</h2>
    <p>
      In 1991 Paul Ginsparg started arXiv, a preprint server where physicists
      shared results before any journal saw them. Wikipedia followed in 2001,
      and the 2002 Budapest Open Access Initiative gave the movement its name.
      The infrastructure keeps changing; Alexandria&apos;s ambition — everything,
      for everyone — hasn&apos;t.
    </p>
  </article>
);

const meta: Meta<ThreeColumnLayoutProps> = {
  title: 'Pages/ThreeColumnLayout',
  component: ThreeColumnLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<ThreeColumnLayoutProps>;

export const Default: Story = {
  args: {
    left: (
      <NavTree
        items={sidebarTree}
        currentPath="#journals"
        LinkComponent={StoryLink}
        aria-label="How knowledge travels"
      />
    ),
    right: <TableOfContents headings={tocHeadings} />,
    children: <SampleContent />,
  },
};

export const WithoutRightColumn: Story = {
  args: {
    left: (
      <NavTree
        items={sidebarTree}
        currentPath="#gutenberg"
        LinkComponent={StoryLink}
        aria-label="How knowledge travels"
      />
    ),
    children: <SampleContent />,
  },
};
