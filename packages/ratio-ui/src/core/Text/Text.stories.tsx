import { Meta, StoryFn } from '@storybook/react-vite';
import { Text, TextProps } from './Text';

const meta: Meta<typeof Text> = {
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: { type: 'select' },
      options: ['p', 'span'],
    },
    size: {
      control: { type: 'select' },
      options: [undefined, 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'],
    },
    weight: {
      control: { type: 'select' },
      options: [undefined, 'light', 'normal', 'medium', 'semibold', 'bold'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'muted', 'subtle'],
    },
    color: {
      control: { type: 'select' },
      options: [undefined, 'primary', 'secondary', 'accent', 'error', 'success', 'warning', 'info'],
    },
    family: {
      control: { type: 'select' },
      options: [undefined, 'sans', 'serif', 'mono'],
    },
    transform: {
      control: { type: 'select' },
      options: [undefined, 'none', 'uppercase'],
    },
    className: { control: 'text' },
  },
};

export default meta;

type TextStory = StoryFn<TextProps>;

const Template: TextStory = args => <Text {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  children: 'This is a text component',
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: 'Text using children prop',
};

/* ── Sizes ── */

export const Sizes: TextStory = () => (
  <div className="space-y-2">
    <Text size="xs">Extra small text (xs)</Text>
    <Text size="sm">Small text (sm)</Text>
    <Text size="base">Base text (base)</Text>
    <Text size="lg">Large text (lg)</Text>
    <Text size="xl">Extra large text (xl)</Text>
    <Text size="2xl">2XL text</Text>
    <Text size="3xl">3XL text</Text>
  </div>
);

/* ── Weights ── */

export const Weights: TextStory = () => (
  <div className="space-y-2">
    <Text weight="light">Light weight</Text>
    <Text weight="normal">Normal weight</Text>
    <Text weight="medium">Medium weight</Text>
    <Text weight="semibold">Semibold weight</Text>
    <Text weight="bold">Bold weight</Text>
  </div>
);

/* ── Variants (tone/prominence) ── */

export const Variants: TextStory = () => (
  <div className="space-y-2">
    <Text variant="default">Default — normal text prominence</Text>
    <Text variant="muted">Muted — secondary, less prominent</Text>
    <Text variant="subtle">Subtle — tertiary, least prominent</Text>
  </div>
);

/* ── Colors (semantic/brand) ── */

export const Colors: TextStory = () => (
  <div className="space-y-2">
    <Text color="primary">Primary color</Text>
    <Text color="secondary">Secondary color</Text>
    <Text color="accent">Accent color</Text>
    <Text color="error">Error color</Text>
    <Text color="success">Success color</Text>
    <Text color="warning">Warning color</Text>
    <Text color="info">Info color</Text>
  </div>
);

/* ── Combined examples ── */

export const MutedSmall = Template.bind({});
MutedSmall.args = {
  children: 'Small muted helper text',
  size: 'sm',
  variant: 'muted',
};

export const LargeBold = Template.bind({});
LargeBold.args = {
  children: 'Large bold text',
  size: 'lg',
  weight: 'bold',
};

export const ErrorMessage = Template.bind({});
ErrorMessage.args = {
  children: 'Something went wrong. Please try again.',
  size: 'sm',
  color: 'error',
};

export const PriceDisplay = Template.bind({});
PriceDisplay.args = {
  children: '1 250 kr',
  size: '2xl',
  weight: 'bold',
};

export const AsSpan = Template.bind({});
AsSpan.args = {
  children: 'This is a span element',
  as: 'span',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  children: 'Text with an icon',
  icon: <span>📍</span>,
};

export const WithPadding = Template.bind({});
WithPadding.args = {
  children: 'Text with padding',
  padding: 'md',
  // Token background (not a hardcoded gray) so the demo surface follows the
  // theme — hardcoded light gray made the text invisible in dark mode.
  className: 'bg-card-hover rounded-lg',
};

export const MonoFamily = Template.bind({});
MonoFamily.args = {
  children: 'a1b2-c3d4-e5f6 — identifiers and code-adjacent text',
  family: 'mono',
  size: 'sm',
};

/**
 * The small meta/caption voice: `family="mono"` + `transform="uppercase"`
 * (which bundles a modest letter-spacing) + `size="xs"` + `variant="subtle"`.
 * Use it for type labels, counts, and other quiet metadata beneath or beside
 * primary content — the same voice as `Heading.Eyebrow`, one size quieter.
 */
export const MetaCaption = () => (
  <div>
    <Text size="lg">What is the patient's date of birth?</Text>
    <Text as="span" size="xs" variant="subtle" family="mono" transform="uppercase">
      date · required
    </Text>
  </div>
);
