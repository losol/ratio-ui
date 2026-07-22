import { Meta, StoryFn } from '@storybook/react-vite';
import { AtSign, MessageCircle, Rss } from 'lucide-react';

import { Footer, Publisher } from './Footer';
import { Button } from '../Button';

const meta: Meta<typeof Footer> = {
  component: Footer,
  tags: ['autodocs'],
};

export default meta;

type FooterStory = StoryFn<typeof Footer>;

const samplePublisher: Publisher = {
  name: 'Example Organization',
  address: '123 Main Street, Oslo',
  phone: '+47 123 45 678',
  email: 'contact@example.com',
  organizationNumber: '123456789',
};

/** A tiny logo mark for the composable examples. */
const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 28 28" fill="none" aria-hidden>
    <rect x="3" y="4" width="22" height="20" rx="3" fill="var(--color-primary-600)" />
    <path d="M6 4 H16.6 V24 H6 A3 3 0 0 1 3 21 V7 A3 3 0 0 1 6 4 Z" fill="var(--color-accent-700)" />
  </svg>
);

const SocialRow = () => (
  <Footer.Social>
    <Footer.Social.Item href="#" label="Mastodon">
      <AtSign />
    </Footer.Social.Item>
    <Footer.Social.Item href="#" label="Discussions">
      <MessageCircle />
    </Footer.Social.Item>
    <Footer.Social.Item href="#" label="RSS">
      <Rss />
    </Footer.Social.Item>
  </Footer.Social>
);

/** The signup form is the consumer's — `Footer.Newsletter` only frames it. */
const SignupForm = () => (
  <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8 }}>
    <input
      type="email"
      aria-label="Email address"
      placeholder="you@example.com"
      style={{
        flex: 1,
        minWidth: 0,
        padding: '10px 14px',
        borderRadius: 999,
        border: '1px solid var(--border-2)',
        background: 'var(--card)',
        color: 'var(--text)',
        outline: 'none',
      }}
    />
    <Button type="submit">Subscribe</Button>
  </form>
);

/**
 * The plain `<Footer>` is a thin shell — the `<footer>` element with the
 * standard background, padding, and a `Container` wrapper. Compose your own
 * layout inside from the building blocks below.
 */
export const Shell: FooterStory = () => (
  <Footer>
    <p>Compose anything you want inside the shell.</p>
  </Footer>
);

/**
 * Each building block on its own: `Footer.Brand` (mark + wordmark + mission),
 * `Footer.LinkColumn` with `Footer.Link` (a link can carry a `tag` badge or an
 * `external` arrow), and `Footer.Publisher` (the imprint block).
 */
export const BuildingBlocks: FooterStory = () => (
  <Footer>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
      <Footer.Brand
        logo={<Logo />}
        name="Meridian"
        mission="A place for careful reading and long-form conversation."
      >
        <SocialRow />
      </Footer.Brand>
      <Footer.LinkColumn title="Product">
        <Footer.Link href="#">Guides</Footer.Link>
        <Footer.Link href="#">Articles</Footer.Link>
        <Footer.Link href="#" tag="New">
          Changelog
        </Footer.Link>
        <Footer.Link href="#" external>
          Status
        </Footer.Link>
      </Footer.LinkColumn>
      <Footer.Publisher publisher={samplePublisher} />
    </div>
  </Footer>
);

/**
 * The full website footer: brand + mission + social on the left, link columns
 * and a newsletter on the right, and a `Footer.BottomBar` under a single subtle
 * rule — copyright left, legal links right.
 */
export const Editorial: FooterStory = () => (
  <Footer>
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: 40 }}>
      <Footer.Brand
        logo={<Logo />}
        name="Meridian"
        mission="A place for careful reading and long-form conversation."
      >
        <SocialRow />
      </Footer.Brand>
      <Footer.LinkColumn title="Product">
        <Footer.Link href="#">Guides</Footer.Link>
        <Footer.Link href="#">Articles</Footer.Link>
        <Footer.Link href="#" tag="New">
          Changelog
        </Footer.Link>
        <Footer.Link href="#">Archive</Footer.Link>
      </Footer.LinkColumn>
      <Footer.LinkColumn title="Company">
        <Footer.Link href="#">About</Footer.Link>
        <Footer.Link href="#">Contact</Footer.Link>
        <Footer.Link href="#" external>
          Status
        </Footer.Link>
      </Footer.LinkColumn>
      <Footer.Newsletter label="Stay in the loop" hint="Occasional notes on new writing and releases.">
        <SignupForm />
      </Footer.Newsletter>
    </div>
    <Footer.BottomBar copyright="© 2026 Meridian">
      <a href="#">Privacy</a>
      <a href="#">Terms</a>
      <a href="#">Accessibility</a>
    </Footer.BottomBar>
  </Footer>
);

/**
 * The same layout with `dark` — a deep surface, and a local dark token scope so
 * every block stays legible without any per-block dark styling.
 */
export const EditorialDark: FooterStory = () => (
  <Footer dark>
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr', gap: 40 }}>
      <Footer.Brand
        logo={<Logo />}
        name="Meridian"
        mission="A place for careful reading and long-form conversation."
      >
        <SocialRow />
      </Footer.Brand>
      <Footer.LinkColumn title="Product">
        <Footer.Link href="#">Guides</Footer.Link>
        <Footer.Link href="#">Articles</Footer.Link>
        <Footer.Link href="#" tag="New">
          Changelog
        </Footer.Link>
        <Footer.Link href="#">Archive</Footer.Link>
      </Footer.LinkColumn>
      <Footer.LinkColumn title="Company">
        <Footer.Link href="#">About</Footer.Link>
        <Footer.Link href="#">Contact</Footer.Link>
        <Footer.Link href="#" external>
          Status
        </Footer.Link>
      </Footer.LinkColumn>
      <Footer.Newsletter label="Stay in the loop" hint="Occasional notes on new writing and releases.">
        <SignupForm />
      </Footer.Newsletter>
    </div>
    <Footer.BottomBar copyright="© 2026 Meridian">
      <a href="#">Privacy</a>
      <a href="#">Terms</a>
      <a href="#">Accessibility</a>
    </Footer.BottomBar>
  </Footer>
);

/**
 * A single-row footer for denser surfaces (apps, dashboards, docs): brand and
 * copyright on the left, a few links on the right. `divider={false}` drops the
 * top rule since there is no body above it.
 */
export const Compact: FooterStory = () => (
  <Footer>
    <Footer.BottomBar
      divider={false}
      copyright={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Logo />
          <span style={{ fontWeight: 600 }}>Meridian</span>
          <span aria-hidden>·</span> © 2026
        </span>
      }
    >
      <a href="#">Help</a>
      <a href="#">Privacy</a>
      <a href="#">Terms</a>
    </Footer.BottomBar>
  </Footer>
);

/**
 * `Footer.Classic` is the pre-2.0 fixed layout — siteTitle and an optional
 * publisher block on the left, children on the right via
 * `md:flex md:justify-between`. Kept for backward compatibility.
 */
export const Classic: FooterStory = () => (
  <Footer.Classic siteTitle="Eventuras" publisher={samplePublisher} />
);

export const ClassicWithChildren: FooterStory = () => (
  <Footer.Classic siteTitle="Eventuras" publisher={samplePublisher}>
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      <div>
        <h3 className="mb-2 font-semibold">Resources</h3>
        <ul className="space-y-1">
          <li><a href="#/docs" className="hover:underline">Documentation</a></li>
          <li><a href="#/api" className="hover:underline">API</a></li>
          <li><a href="#/support" className="hover:underline">Support</a></li>
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Company</h3>
        <ul className="space-y-1">
          <li><a href="#/about" className="hover:underline">About</a></li>
          <li><a href="#/contact" className="hover:underline">Contact</a></li>
          <li><a href="#/privacy" className="hover:underline">Privacy</a></li>
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Legal</h3>
        <ul className="space-y-1">
          <li><a href="#/terms" className="hover:underline">Terms</a></li>
          <li><a href="#/privacy-policy" className="hover:underline">Privacy Policy</a></li>
          <li><a href="#/cookie-policy" className="hover:underline">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
  </Footer.Classic>
);
