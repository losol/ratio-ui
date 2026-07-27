import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './Stack';
import { Text } from '../../core/Text';
import { Heading } from '../../core/Heading';
import { Card } from '../../core/Card';
import { Badge } from '../../core/Badge';
import { Tabs } from '../../core/Tabs';

const meta = {
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: { type: 'select' }, options: ['vertical', 'horizontal'] },
    gap: { control: { type: 'select' }, options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {
    gap: 'sm',
    children: (
      <>
        <Text>First paragraph of a section.</Text>
        <Text>Second paragraph, spaced by the stack's gap.</Text>
        <Text>Third paragraph — no margins on the items themselves.</Text>
      </>
    ),
  },
};

export const HorizontalWithDividers: Story = {
  args: {
    direction: 'horizontal',
    gap: 'lg',
    dividers: true,
    children: (
      <>
        <Text as="span">Overview</Text>
        <Text as="span">Details</Text>
        <Text as="span">History</Text>
      </>
    ),
  },
};

// A read-only outline row: primary text with a quiet meta caption beneath,
// on a hover-lifting ghost surface.
const OutlineRow = ({ question, type }: { question: string; type: string }) => (
  <Card transparent hoverEffect padding="xs" radius="lg" gap="none">
    <Text size="lg">{question}</Text>
    <Text as="span" size="xs" variant="subtle" family="mono" transform="uppercase">
      {type}
    </Text>
  </Card>
);

// A group of rows: serif title + meta count on a shared baseline, children
// nested under a rail.
const OutlineGroup = ({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) => (
  <Stack gap="xs">
    <Stack direction="horizontal" gap="sm" align="baseline">
      <Text as="span" family="serif" size="xl" weight="semibold" variant="muted">
        {title}
      </Text>
      <Text as="span" size="xs" variant="subtle" family="mono" transform="uppercase">
        group · {count}
      </Text>
    </Stack>
    <Stack rail gap="none">{children}</Stack>
  </Stack>
);

/**
 * A complete editorial outline — a clinical questionnaire's structure
 * rendered read-only — composed entirely from props, no `className` on any
 * component: `Card transparent hoverEffect` for the rows, the Text
 * meta/caption voice (`family="mono"` + `transform="uppercase"`) for type
 * labels, `family="serif"` for group titles, `align="baseline"` to seat a
 * title and its caption on one line, and `rail` for nesting.
 */
export const QuestionnaireOutline: Story = {
  args: { children: null },
  render: () => (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Card padding="lg" gap="none">
        <Stack direction="horizontal" gap="sm" align="baseline">
          <Heading as="h1">Questionnaire/f201</Heading>
          <Badge status="success">active</Badge>
        </Stack>
        <Text variant="subtle" size="sm" paddingBottom="md">
          7 questions · 2 groups
        </Text>
        <Tabs defaultSelectedKey="Form">
          <Tabs.Item title="Summary">
            <Text variant="subtle">Summary of the questionnaire.</Text>
          </Tabs.Item>
          <Tabs.Item title="Form">
            <Stack gap="md">
              <OutlineRow question="Do you have allergies?" type="boolean" />
              <OutlineGroup title="General questions" count={4}>
                <OutlineRow question="What is your gender?" type="string" />
                <OutlineRow question="What is your date of birth?" type="date" />
                <OutlineRow question="What is your country of birth?" type="string" />
                <OutlineRow question="What is your marital status?" type="string" />
              </OutlineGroup>
              <OutlineGroup title="Intoxications" count={2}>
                <OutlineRow question="Do you smoke?" type="boolean" />
                <OutlineRow question="Do you drink alcohol?" type="boolean" />
              </OutlineGroup>
            </Stack>
          </Tabs.Item>
          <Tabs.Item title="Content tree">
            <Text variant="subtle">Hierarchy view.</Text>
          </Tabs.Item>
          <Tabs.Item title="Source">
            <Text variant="subtle">Raw source.</Text>
          </Tabs.Item>
        </Tabs>
      </Card>
    </div>
  ),
};

/**
 * `rail` draws a `--border-1` hairline down the left edge with a matching
 * inset, marking the children as one level deeper in a hierarchy. Nest
 * railed stacks for outlines — document structures, question groups,
 * threaded discussions. Vertical stacks only.
 */
export const NestingRail: Story = {
  // `children` is a required StackProps field, so satisfy the args type even
  // though `render` supplies the whole tree itself.
  args: { children: null },
  render: () => (
    <Stack gap="sm">
      <Heading.Group>
        <Heading.Eyebrow>Group · 3</Heading.Eyebrow>
        <Heading as="h3">Contact details</Heading>
      </Heading.Group>
      <Stack rail gap="sm">
        <div>
          <Text>What is your email address?</Text>
          <Text as="span" size="xs" variant="subtle" family="mono" transform="uppercase">
            string
          </Text>
        </div>
        <div>
          <Text>May we contact you by phone?</Text>
          <Text as="span" size="xs" variant="subtle" family="mono" transform="uppercase">
            boolean
          </Text>
        </div>
        <Stack rail gap="sm">
          <div>
            <Text>What is your phone number?</Text>
            <Text as="span" size="xs" variant="subtle" family="mono" transform="uppercase">
              string
            </Text>
          </div>
        </Stack>
      </Stack>
    </Stack>
  ),
};
