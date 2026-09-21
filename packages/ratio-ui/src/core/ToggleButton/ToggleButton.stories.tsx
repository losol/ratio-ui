import { Meta, StoryFn } from '@storybook/react-vite';
import { ToggleButton, ToggleButtonProps } from './ToggleButton';
import { useState } from 'react';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  tags: ['autodocs'],
  args: {
    variant: 'default',
    isDisabled: false,
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'outline', 'tint'],
    },
    isDisabled: { control: 'boolean' },
  },
};

export default meta;

type ToggleButtonStory = StoryFn<ToggleButtonProps>;

export const Playground: ToggleButtonStory = args => {
  const [isSelected, setSelected] = useState(false);
  return (
    <ToggleButton {...args} isSelected={isSelected} onChange={setSelected}>
      Toggle Me
    </ToggleButton>
  );
};

export const Default: ToggleButtonStory = () => {
  const [isSelected, setSelected] = useState(false);
  return (
    <ToggleButton variant="default" isSelected={isSelected} onChange={setSelected}>
      Default Toggle
    </ToggleButton>
  );
};

export const Primary: ToggleButtonStory = () => {
  const [isSelected, setSelected] = useState(false);
  return (
    <ToggleButton variant="primary" isSelected={isSelected} onChange={setSelected}>
      Primary Toggle
    </ToggleButton>
  );
};

export const Outline: ToggleButtonStory = () => {
  const [isSelected, setSelected] = useState(false);
  return (
    <ToggleButton variant="outline" isSelected={isSelected} onChange={setSelected}>
      Outline Toggle
    </ToggleButton>
  );
};

export const Selected: ToggleButtonStory = () => {
  const [isSelected, setSelected] = useState(true);
  return (
    <ToggleButton variant="default" isSelected={isSelected} onChange={setSelected}>
      Selected Toggle
    </ToggleButton>
  );
};

export const Disabled: ToggleButtonStory = () => {
  return (
    <ToggleButton variant="default" isDisabled>
      Disabled Toggle
    </ToggleButton>
  );
};

export const AllVariants: ToggleButtonStory = () => {
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);
  const [selected3, setSelected3] = useState(false);

  return (
    <div className="flex gap-4 flex-wrap">
      <ToggleButton variant="default" isSelected={selected1} onChange={setSelected1}>
        Default
      </ToggleButton>
      <ToggleButton variant="primary" isSelected={selected2} onChange={setSelected2}>
        Primary
      </ToggleButton>
      <ToggleButton variant="outline" isSelected={selected3} onChange={setSelected3}>
        Outline
      </ToggleButton>
    </div>
  );
};

/**
 * `tint` (beta) is a standalone pill whose selected state is a soft fill and
 * whose text never changes — for toggles that sit inside content, where a
 * solid fill would outshout the text around them.
 */
export const Tint: ToggleButtonStory = () => {
  const [saved, setSaved] = useState(true);
  const [following, setFollowing] = useState(false);

  return (
    <div className="flex gap-2">
      <ToggleButton variant="tint" size="sm" isSelected={saved} onChange={setSaved}>
        Saved
      </ToggleButton>
      <ToggleButton variant="tint" size="sm" isSelected={following} onChange={setFollowing}>
        Follow thread
      </ToggleButton>
    </div>
  );
};
