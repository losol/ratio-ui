import { Meta, StoryFn } from '@storybook/react-vite';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { DescriptionList } from './DescriptionList';

const meta: Meta<typeof DescriptionList> = {
  component: DescriptionList,
  tags: ['autodocs'],
};

export default meta;

type DescriptionListStory = StoryFn<typeof DescriptionList>;

export const Playground: DescriptionListStory = () => (
  <DescriptionList>
    <DescriptionList.Item>
      <DescriptionList.Term>Name</DescriptionList.Term>
      <DescriptionList.Definition>John Doe</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Email</DescriptionList.Term>
      <DescriptionList.Definition>john@example.com</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Role</DescriptionList.Term>
      <DescriptionList.Definition>Administrator</DescriptionList.Definition>
    </DescriptionList.Item>
  </DescriptionList>
);

export const UserProfile: DescriptionListStory = () => (
  <DescriptionList>
    <DescriptionList.Item>
      <DescriptionList.Term>Full Name</DescriptionList.Term>
      <DescriptionList.Definition>Jane Smith</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Email Address</DescriptionList.Term>
      <DescriptionList.Definition>jane.smith@example.com</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Phone Number</DescriptionList.Term>
      <DescriptionList.Definition>+47 123 45 678</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Address</DescriptionList.Term>
      <DescriptionList.Definition>
        123 Main Street<br />
        Oslo, 0123<br />
        Norway
      </DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Member Since</DescriptionList.Term>
      <DescriptionList.Definition>January 2023</DescriptionList.Definition>
    </DescriptionList.Item>
  </DescriptionList>
);

/**
 * `variant="facts"` renders an editorial key-facts strip — mono overline
 * terms above serif values in a bordered grid. Use it under a page title
 * to surface the handful of facts a reader scans for first. Here: the 1927
 * Solvay Conference, where 17 of the 29 attendees were or became Nobel
 * laureates — the fact-strip shape an event page needs.
 */
export const FactsStrip: DescriptionListStory = () => (
  <DescriptionList variant="facts">
    <DescriptionList.Description term="Date">24–29 October 1927</DescriptionList.Description>
    <DescriptionList.Description term="Location">Brussels, Belgium</DescriptionList.Description>
    <DescriptionList.Description term="Attendees">29 physicists</DescriptionList.Description>
    <DescriptionList.Description term="Nobel laureates">17</DescriptionList.Description>
  </DescriptionList>
);

/**
 * `variant="meta"` renders compact label/value rows — the same mono
 * overline voice as `facts`, laid out for narrow surfaces like card
 * asides and order summaries. Here: Faraday's 1860 Christmas Lectures,
 * "The Chemical History of a Candle" — public science lectures that
 * became one of the most reprinted science books ever.
 */
export const MetaRows: DescriptionListStory = () => (
  <Card padding="md" className="max-w-sm">
    <div className="flex items-baseline justify-between gap-4 mb-4">
      <span className="font-medium">Christmas Lectures</span>
      <Badge variant="subtle" status="success">
        Open
      </Badge>
    </div>
    <DescriptionList variant="meta">
      <DescriptionList.Description term="Lecturer">Michael Faraday</DescriptionList.Description>
      <DescriptionList.Description term="Location">Royal Institution, London</DescriptionList.Description>
      <DescriptionList.Description term="Held">December 1860</DescriptionList.Description>
      <DescriptionList.Description term="Audience">Young people</DescriptionList.Description>
    </DescriptionList>
  </Card>
);

export const ProductDetails: DescriptionListStory = () => (
  <DescriptionList>
    <DescriptionList.Item>
      <DescriptionList.Term>Product Name</DescriptionList.Term>
      <DescriptionList.Definition>Premium Widget</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>SKU</DescriptionList.Term>
      <DescriptionList.Definition>WDG-001-PREM</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Price</DescriptionList.Term>
      <DescriptionList.Definition>$299.99</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Stock Status</DescriptionList.Term>
      <DescriptionList.Definition>In Stock (42 units)</DescriptionList.Definition>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <DescriptionList.Term>Description</DescriptionList.Term>
      <DescriptionList.Definition>
        This premium widget offers exceptional quality and performance for professional use.
      </DescriptionList.Definition>
    </DescriptionList.Item>
  </DescriptionList>
);
