import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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

/** Hints and errors describe the control without becoming part of its name. */
export const AccessibleDescriptions: Story = {
  render: () => {
    const [hint, setHint] = useState(true);
    const [error, setError] = useState(true);
    return (
      <div>
        <p id="caller-help">Caller guidance.</p>
        <p id="caller-extra">Extra guidance.</p>
        <button onClick={() => setHint(!hint)}>Toggle hint</button>
        <button onClick={() => setError(!error)}>Toggle error</button>
        {[false, true].map((multiline) => {
          const id = multiline ? 'custom-bio' : 'custom-email';
          const name = multiline ? 'bio' : 'email';
          return (
            <TextField
              key={id}
              id={id}
              name={name}
              label={multiline ? 'Biography' : 'Email'}
              multiline={multiline}
              noWrapper={multiline}
              description={hint ? 'Field guidance.' : undefined}
              errors={error ? { [name]: { message: 'Please correct this field.' } } : { [name]: {} }}
              aria-describedby=" caller-help  caller-extra caller-help "
            />
          );
        })}
        <TextField name="fallback" label="Fallback" description="Name-derived hint." />
        <TextField name="dedup" label="Deduplicated" description="One hint." errors={{ dedup: { message: 'One error.' } }} aria-describedby="dedup-description dedup-error dedup-description" />
        <TextField name="empty" id={undefined} label="Empty" errors={{ empty: {} }} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fields = ['Email', 'Biography'].map((name) => canvas.getByRole('textbox', { name }));
    const check = async (hint: boolean, error: boolean) => {
      for (const field of fields) {
        const ids = ['caller-help', 'caller-extra', ...(hint ? [`${field.id}-description`] : []), ...(error ? [`${field.id}-error`] : [])];
        await expect(field).toHaveAttribute('aria-describedby', ids.join(' '));
        await expect(field).toHaveAccessibleDescription(`Caller guidance. Extra guidance.${hint ? ' Field guidance.' : ''}${error ? ' Please correct this field.' : ''}`);
        for (const id of ids) {
          await expect(canvasElement.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
        }
        await expect(field).toHaveAccessibleName(field.tagName === 'TEXTAREA' ? 'Biography' : 'Email');
      }
    };
    await check(true, true);
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle hint' }));
    await check(false, true);
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle error' }));
    await check(false, false);
    await expect(canvas.queryAllByRole('alert')).toHaveLength(1); // Only the separate dedup field.
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle hint' }));
    await check(true, false);
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle error' }));
    await check(true, true);
    await expect(canvas.getByRole('textbox', { name: 'Fallback' })).toHaveAttribute('aria-describedby', 'fallback-description');
    await expect(canvas.getByRole('textbox', { name: 'Deduplicated' })).toHaveAttribute('aria-describedby', 'dedup-description dedup-error');
    const empty = canvas.getByRole('textbox', { name: 'Empty' });
    await expect(empty).toHaveAttribute('id', 'empty');
    await expect(empty).not.toHaveAttribute('aria-describedby');
    await expect(canvasElement.querySelectorAll('label[role="alert"]')).toHaveLength(0);
  },
};
