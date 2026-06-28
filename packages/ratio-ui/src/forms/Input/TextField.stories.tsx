import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
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
    errors: { email: 'Invalid email address' },
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
