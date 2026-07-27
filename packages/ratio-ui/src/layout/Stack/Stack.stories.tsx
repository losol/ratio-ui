import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './Stack';
import { Text } from '../../core/Text';
import { Heading } from '../../core/Heading';

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
