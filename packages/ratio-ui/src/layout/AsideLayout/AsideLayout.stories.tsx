import { Meta, StoryFn } from '@storybook/react-vite';
import { Card } from '../../core/Card';
import { Heading } from '../../core/Heading';
import { AsideLayout } from './AsideLayout';

const meta: Meta<typeof AsideLayout> = {
  component: AsideLayout,
  tags: ['autodocs'],
};

export default meta;

type AsideLayoutStory = StoryFn<typeof AsideLayout>;

// The article is about the pattern it demonstrates: a sticky aside as a
// wayfinding aid in long-form text.
const article = (
  <>
    <Heading as="h2">Why long-form text needs a companion rail</Heading>
    <p className="mb-4">
      Most readers of a long page never reach its end. They arrive with a question, scan for
      the answer, and leave when they find it — or when they stop believing the page has it.
      A companion rail keeps the page's most-asked answers visible during that scan.
    </p>
    <p className="mb-4">
      This is progressive disclosure in layout form: the main column carries the full
      argument for readers who commit, while the aside carries the summary for readers who
      are still deciding. Neither audience has to scroll on the other's behalf.
    </p>
    <p className="mb-4">
      The pattern is old. Medieval manuscripts kept glosses in the margin, beside the line
      they explained, so a reader could consult them without losing their place in the main
      text. A sticky aside is the same contract: context stays within reach while the eye
      travels.
    </p>
    <p className="mb-4">
      Position matters because memory is spatial. Readers remember that the registration
      deadline lives "up right" long before they remember the date itself. An aside that
      scrolls away breaks that spatial anchor; one that follows preserves it.
    </p>
    <p className="mb-4">
      There is a limit: a rail that shouts competes with the text instead of serving it.
      Keep the aside to what a reader acts on — key facts, a call to action, a table of
      contents — and let the main column do the persuading.
    </p>
    <p className="mb-4">
      On small screens the rail concedes. The aside stacks below the content, because on a
      phone nothing can float beside a paragraph without stealing its width — the summary
      becomes a destination instead of a companion.
    </p>
  </>
);

export const Playground: AsideLayoutStory = () => (
  <AsideLayout>
    <AsideLayout.Main>{article}</AsideLayout.Main>
    <AsideLayout.Aside aria-label="Article summary">
      <Card padding="md">
        <Heading as="h2" className="text-xl m-0">
          At a glance
        </Heading>
        <p className="mt-2 text-sm">
          Readers scan before they read. This aside stays beside the article from the{' '}
          <code>lg</code> breakpoint — the summary in reach while the eye travels.
        </p>
      </Card>
    </AsideLayout.Aside>
  </AsideLayout>
);

/**
 * `top` on the aside offsets the sticky position for an app header rendered
 * above the layout — same convention as `Sidebar`. It takes a px number or
 * any CSS length: the header here is `h-16`, so `calc(var(--spacing) * 20)`
 * (header plus one row of breathing room) stays exact while the root font
 * size — and with it `--spacing` — scales with the viewport. `width` picks
 * the rail width from `lg`.
 */
export const UnderAppHeader: AsideLayoutStory = () => (
  <div>
    <div className="sticky top-0 z-10 h-16 border-b border-border-1 bg-surface flex items-center px-4">
      App header (64px)
    </div>
    <div className="p-4">
      <AsideLayout>
        <AsideLayout.Main>{article}</AsideLayout.Main>
        <AsideLayout.Aside top="calc(var(--spacing) * 20)" width="lg" aria-label="Key facts">
          <Card padding="md">
            <p className="text-sm">
              Sticks 20 spacing units down: header height plus breathing room, so the rail
              never slides under the chrome — at every viewport width.
            </p>
          </Card>
        </AsideLayout.Aside>
      </AsideLayout>
    </div>
  </div>
);
