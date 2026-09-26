import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Checkbox } from './Checkbox';
import { Label } from '../common/Label';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Forms/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    multiline: { control: 'boolean' },
    showCopyToClipboard: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

/** Default text input */
export const Default: Story = {
  args: {
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Enter your first name',
    description: 'This is a standard text input',
  },
};

/** Disabled input */
export const Disabled: Story = {
  args: {
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Disabled input',
    disabled: true,
  },
};

/** With error message */
export const WithError: Story = {
  args: {
    name: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email',
    errors: { email: { message: 'Invalid email address' } },
  },
};

/** Read-only field with a copy-to-clipboard button in the trailing slot */
export const ReadOnlyWithCopy: Story = {
  args: {
    name: 'apiKey',
    label: 'API key',
    defaultValue: 'demo_api_key_1234567890abcdef',
    readOnly: true,
    showCopyToClipboard: true,
    description: 'Read-only value with one-tap copy.',
  },
};

/** Multiline textarea */
export const Multiline: Story = {
  args: {
    name: 'bio',
    label: 'Bio',
    placeholder: 'Write something about yourself...',
    description: 'This field allows multiple lines.',
    multiline: true,
    rows: 4,
  },
};

/**
 * The `className` rule shared by the form parts: extra classes merge on top
 * of the defaults (a later class wins a conflict), and `unstyled` drops the
 * defaults to style from scratch.
 */
export const ClassNameAndUnstyled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField name="merged" label="Merged" className="font-mono" testId="merged" />
      <TextField name="bare" label="Unstyled" unstyled className="font-mono" testId="bare" />
      <Label className="uppercase">Merged label</Label>
      <Label unstyled className="uppercase">Unstyled label</Label>
      <Checkbox id="merged-check" className="w-6 h-6">
        <Checkbox.Label className="italic">Merged checkbox</Checkbox.Label>
      </Checkbox>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // className merges: the default input chrome stays, the extra class is added.
    const merged = canvas.getByTestId('merged');
    await expect(merged).toHaveClass('font-mono');
    await expect(getComputedStyle(merged).borderTopWidth).not.toBe('0px');

    // unstyled: only the caller's classes.
    const bare = canvas.getByTestId('bare');
    await expect(bare).toHaveClass('font-mono');
    await expect(getComputedStyle(bare).borderTopWidth).toBe('0px');

    // Labels: the token font weight stays when merged, drops when unstyled.
    await expect(getComputedStyle(canvas.getByText('Merged label')).fontWeight).toBe('500');
    await expect(getComputedStyle(canvas.getByText('Unstyled label')).fontWeight).not.toBe('500');

    // Checkbox: a later size wins the conflict, the theme accent stays.
    const box = canvasElement.querySelector<HTMLInputElement>('#merged-check')!;
    await expect(box).toHaveClass('w-6', 'h-6', 'accent-(--primary)');
    await expect(box).not.toHaveClass('w-5');
    await expect(canvas.getByText('Merged checkbox')).toHaveClass('italic', 'font-bold');
  },
};
