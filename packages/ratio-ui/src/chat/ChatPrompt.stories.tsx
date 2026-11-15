import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ChatPrompt, type ChatPromptResponse } from './ChatPrompt';

const meta: Meta<typeof ChatPrompt> = {
  title: 'Chat/Prompt (beta)',
  component: ChatPrompt,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A small form in a chat message: confirm or decline, or pick from a few options and send. The prompt is data, so an agent can ask with a tool call. It is controlled: it reports the answer, and the caller moves the prompt from `open` through `sending` to `answered`, where the controls give way to a receipt.',
      },
    },
  },
  decorators: [
    Story => (
      <div data-testid="prompts" className="max-w-xl text-[0.875rem] leading-normal">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatPrompt>;

// The story alone: Storybook's own mode toggle is a button in the canvas too.
const scope = (canvasElement: HTMLElement) => within(within(canvasElement).getByTestId('prompts'));

const rooms: ChatPrompt = {
  kind: 'choice',
  title: 'Which room should I book?',
  options: [
    { value: 'a', label: 'Room A' },
    { value: 'b', label: 'Room B' },
    { value: 'c', label: 'Room C' },
  ],
};

const shifts: ChatPrompt = {
  kind: 'choice',
  multiple: true,
  title: 'Which shifts can you take?',
  description: 'Pick every one that works.',
  submitLabel: 'Sign up',
  options: [
    { value: 'doors', label: 'Doors', description: '10:30 to 11:00, keynote hall' },
    { value: 'badges', label: 'Badges', description: '09:00 to 10:00, in the foyer' },
    { value: 'teardown', label: 'Teardown', description: 'After 17:00' },
    { value: 'night', label: 'Night watch', description: 'Already full', disabled: true },
  ],
};

/**
 * `confirm`: two buttons, and one press answers. The prompt is a group
 * named by its title, and it does not take focus when it arrives.
 */
export const Confirm: Story = {
  args: {
    prompt: { kind: 'confirm', title: 'Book room B for 14:00?' },
    onRespond: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = scope(canvasElement);
    const group = canvas.getByRole('group', { name: 'Book room B for 14:00?' });
    await expect(group).not.toHaveFocus();
    await expect(group).toHaveAttribute('data-status', 'open');

    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onRespond).toHaveBeenLastCalledWith({ kind: 'confirm', accepted: false });
    await userEvent.click(canvas.getByRole('button', { name: 'OK' }));
    await expect(args.onRespond).toHaveBeenLastCalledWith({ kind: 'confirm', accepted: true });
  },
};

/**
 * The prompt brings its own button text, and `tone: 'danger'` when
 * confirming cannot be undone. The label says what happens; the colour
 * only agrees with it.
 */
export const ConfirmDanger: Story = {
  args: {
    prompt: {
      kind: 'confirm',
      tone: 'danger',
      title: 'Delete the draft programme?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      declineLabel: 'Keep it',
    },
    onRespond: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = scope(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    await expect(args.onRespond).toHaveBeenLastCalledWith({ kind: 'confirm', accepted: true });
    await expect(canvas.queryByRole('button', { name: 'OK' })).toBeNull();
  },
};

/**
 * `choice`: pick, then send. "Send" waits for the first pick, so nothing
 * is answered by a slip of the finger, and picking another radio moves
 * the pick.
 */
export const Choice: Story = {
  args: { prompt: rooms, onRespond: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = scope(canvasElement);
    const send = canvas.getByRole('button', { name: 'Send' });
    await expect(canvas.getAllByRole('radio')).toHaveLength(3);
    await expect(send).toBeDisabled();

    await userEvent.click(canvas.getByRole('radio', { name: 'Room A' }));
    await userEvent.click(canvas.getByRole('radio', { name: 'Room C' }));
    await expect(canvas.getByRole('radio', { name: 'Room A' })).not.toBeChecked();
    await expect(args.onRespond).not.toHaveBeenCalled();

    await waitFor(() => expect(send).toBeEnabled());
    await userEvent.click(send);
    await expect(args.onRespond).toHaveBeenCalledTimes(1);
    await expect(args.onRespond).toHaveBeenLastCalledWith({ kind: 'choice', values: ['c'] });
  },
};

/**
 * With `multiple` the options are checkboxes. A description is read after
 * the option's name, and the answer lists the values in the options'
 * order, whatever order they were picked in.
 */
export const ChoiceMultiple: Story = {
  args: { prompt: shifts, onRespond: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = scope(canvasElement);
    const doors = canvas.getByRole('checkbox', { name: 'Doors' });
    await expect(doors).toHaveAccessibleDescription('10:30 to 11:00, keynote hall');
    await expect(canvas.getByRole('checkbox', { name: 'Night watch' })).toBeDisabled();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Teardown' }));
    await userEvent.click(doors);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Badges' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Badges' }));

    await userEvent.click(canvas.getByRole('button', { name: 'Sign up' }));
    await expect(args.onRespond).toHaveBeenCalledTimes(1);
    await expect(args.onRespond).toHaveBeenLastCalledWith({
      kind: 'choice',
      values: ['doors', 'teardown'],
    });
  },
};

/** By keyboard: the arrow keys move the pick, and Enter on "Send" sends it. */
export const ChoiceKeyboard: Story = {
  args: { prompt: rooms, onRespond: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = scope(canvasElement);
    canvas.getByRole('radio', { name: 'Room A' }).focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Room B' })).toBeChecked();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Send' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRespond).toHaveBeenCalledTimes(1);
    await expect(args.onRespond).toHaveBeenLastCalledWith({ kind: 'choice', values: ['b'] });
  },
};

/**
 * `dismissible` adds "Skip". It answers `{ kind: 'dismissed' }`, which is
 * "did not answer" and not the same as declining.
 */
export const Dismissible: Story = {
  args: {
    prompt: { ...rooms, dismissible: true },
    onRespond: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Skip' }));
    await expect(args.onRespond).toHaveBeenCalledTimes(1);
    await expect(args.onRespond).toHaveBeenLastCalledWith({ kind: 'dismissed' });
  },
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * The whole life, as an app drives it: `onRespond` reports the answer,
 * the app sets `sending` with the `response` while it is on its way, then
 * `answered`. The controls are held, then give way to the receipt. Focus
 * waits on the prompt, so it does not fall to the page when the pressed
 * button goes.
 */
export const Lifecycle: Story = {
  render: function LifecycleStory(args) {
    const [prompt, setPrompt] = useState(args.prompt);
    const respond = async (response: ChatPromptResponse) => {
      setPrompt(current => ({ ...current, status: 'sending', response }));
      await wait(400);
      setPrompt(current => ({ ...current, status: 'answered' }));
    };
    return <ChatPrompt {...args} prompt={prompt} onRespond={respond} />;
  },
  args: { prompt: rooms },
  play: async ({ canvasElement }) => {
    const canvas = scope(canvasElement);
    const group = canvas.getByRole('group', { name: 'Which room should I book?' });

    canvas.getByRole('radio', { name: 'Room B' }).focus();
    await userEvent.keyboard(' ');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    // On its way: the controls are still there, and held.
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'sending'));
    await expect(group).toHaveAttribute('aria-busy', 'true');
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled();
    await expect(canvas.getByRole('radio', { name: 'Room A' })).toBeDisabled();
    await expect(canvas.getByRole('radio', { name: 'Room B' })).toBeChecked();
    await expect(group).toHaveFocus();

    // Arrived: a receipt, and nothing left to press.
    await waitFor(() => expect(group).toHaveAttribute('data-status', 'answered'));
    await expect(group).toHaveTextContent('Answered Room B');
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.queryByRole('radio')).toBeNull();
    await expect(group).not.toHaveAttribute('aria-busy');
    await expect(group).toHaveFocus();
  },
};

/** `sending`: every control is held, and the one that was pressed spins. */
export const Sending: Story = {
  render: args => (
    <div className="flex flex-col gap-3">
      <ChatPrompt
        {...args}
        prompt={{
          kind: 'confirm',
          title: 'Book room B for 14:00?',
          dismissible: true,
          status: 'sending',
          response: { kind: 'confirm', accepted: true },
        }}
      />
      <ChatPrompt
        {...args}
        prompt={{ ...shifts, status: 'sending', response: { kind: 'choice', values: ['doors', 'teardown'] } }}
      />
    </div>
  ),
  args: { onRespond: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = scope(canvasElement);
    for (const button of canvas.getAllByRole('button')) await expect(button).toBeDisabled();
    for (const box of canvas.getAllByRole('checkbox')) await expect(box).toBeDisabled();
    // The answer on its way shows as picked, also in a form that mounts now.
    await expect(canvas.getByRole('checkbox', { name: 'Doors' })).toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Badges' })).not.toBeChecked();
    await expect(args.onRespond).not.toHaveBeenCalled();
  },
};

/**
 * `answered`: the receipt, in the prompt's own words. A prompt with a
 * `response` and no `status` is answered. A value the options no longer
 * offer is shown as it is.
 */
export const Answered: Story = {
  render: args => (
    <div className="flex flex-col gap-3">
      <ChatPrompt
        {...args}
        testId="yes"
        prompt={{
          kind: 'confirm',
          title: 'Are you coming to the dinner?',
          confirmLabel: 'Yes',
          declineLabel: 'No',
          response: { kind: 'confirm', accepted: true },
        }}
      />
      <ChatPrompt
        {...args}
        testId="declined"
        prompt={{ kind: 'confirm', title: 'Book room B for 14:00?', response: { kind: 'confirm', accepted: false } }}
      />
      <ChatPrompt
        {...args}
        testId="shifts"
        prompt={{ ...shifts, response: { kind: 'choice', values: ['doors', 'teardown'] } }}
      />
      <ChatPrompt {...args} testId="gone" prompt={{ ...rooms, response: { kind: 'choice', values: ['d'] } }} />
      <ChatPrompt {...args} testId="skipped" prompt={{ ...rooms, response: { kind: 'dismissed' } }} />
      <ChatPrompt {...args} testId="bare" prompt={{ ...rooms, status: 'answered' }} />
    </div>
  ),
  args: { onRespond: fn() },
  play: async ({ canvasElement }) => {
    const canvas = scope(canvasElement);
    await expect(canvas.getByTestId('yes')).toHaveTextContent('Answered Yes');
    await expect(canvas.getByTestId('declined')).toHaveTextContent('Answered Cancel');
    await expect(canvas.getByTestId('shifts')).toHaveTextContent('Answered Doors, Teardown');
    await expect(canvas.getByTestId('gone')).toHaveTextContent('Answered d');
    await expect(canvas.getByTestId('skipped')).toHaveTextContent('Answered Skipped');
    await expect(canvas.getByTestId('bare')).toHaveTextContent(/Answered$/);
    // Removed, not disabled: nothing here reads as a question still open.
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.queryByRole('radio')).toBeNull();
    await expect(canvas.queryByRole('checkbox')).toBeNull();
  },
};

/** `closed`: it no longer takes an answer. `closedNote` says why, as given. */
export const Closed: Story = {
  render: args => (
    <div className="flex flex-col gap-3">
      <ChatPrompt {...args} testId="note" prompt={{ ...rooms, status: 'closed', closedNote: 'Expired at 12:00' }} />
      <ChatPrompt
        {...args}
        testId="plain"
        prompt={{ kind: 'confirm', title: 'Book room B for 14:00?', status: 'closed' }}
      />
    </div>
  ),
  args: { onRespond: fn() },
  play: async ({ canvasElement }) => {
    const canvas = scope(canvasElement);
    await expect(canvas.getByTestId('note')).toHaveTextContent('Expired at 12:00');
    await expect(canvas.getByTestId('plain')).toHaveTextContent('No longer open');
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.queryByRole('radio')).toBeNull();
  },
};

/**
 * Without `onRespond` the prompt is read-only: what was asked, with a
 * choice's options as a plain list, and nothing to press. A read-only
 * `confirm` with no title or description has nothing to show, and renders
 * nothing.
 */
export const ReadOnly: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ChatPrompt prompt={shifts} />
      <ChatPrompt prompt={{ kind: 'confirm', title: 'Book room B for 14:00?' }} />
      <ChatPrompt prompt={{ kind: 'confirm' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = scope(canvasElement);
    await expect(canvas.getAllByRole('group')).toHaveLength(2);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.queryByRole('checkbox')).toBeNull();
  },
};

/**
 * A `kind` this version does not know, as an agent written for a later
 * one may send: the title and description, and no controls. The message's
 * own text still asks the question.
 */
export const UnknownKind: Story = {
  args: {
    prompt: {
      kind: 'fields',
      title: 'Who should the badge be for?',
      description: 'Name and organisation.',
      fields: [{ kind: 'text', name: 'name', label: 'Name' }],
    } as unknown as ChatPrompt,
    onRespond: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = scope(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Who should the badge be for?' })).toBeVisible();
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.queryByRole('textbox')).toBeNull();
  },
};

/**
 * `labels` holds the built-in text, for another language. The prompt's own
 * labels still win: the agent knows what it is asking, the app knows its
 * language. A prompt with no title is named by `labels.question`.
 */
export const Labels: Story = {
  render: args => (
    <div className="flex flex-col gap-3">
      <ChatPrompt {...args} prompt={{ kind: 'confirm', dismissible: true }} />
      <ChatPrompt {...args} prompt={{ kind: 'confirm', title: 'Slette utkastet?', confirmLabel: 'Slett' }} />
      <ChatPrompt
        {...args}
        testId="receipt"
        prompt={{ ...rooms, title: 'Hvilket rom?', response: { kind: 'dismissed' } }}
      />
      <ChatPrompt {...args} testId="closed" prompt={{ ...rooms, title: 'Hvilket rom?', status: 'closed' }} />
    </div>
  ),
  args: {
    onRespond: fn(),
    labels: {
      confirm: 'OK',
      decline: 'Avbryt',
      submit: 'Send',
      dismiss: 'Hopp over',
      dismissed: 'Hoppet over',
      answered: 'Svart',
      closed: 'Ikke lenger åpen',
      question: 'Spørsmål',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = scope(canvasElement);
    const untitled = canvas.getByRole('group', { name: 'Spørsmål' });
    await expect(within(untitled).getByRole('button', { name: 'Avbryt' })).toBeVisible();
    await expect(within(untitled).getByRole('button', { name: 'Hopp over' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Slett' })).toBeVisible();
    await expect(canvas.getByTestId('receipt')).toHaveTextContent('Svart Hoppet over');
    await expect(canvas.getByTestId('closed')).toHaveTextContent('Ikke lenger åpen');
  },
};

/** Long text wraps inside a narrow column, and the buttons wrap under each other. */
export const Narrow: Story = {
  args: {
    prompt: {
      kind: 'choice',
      dismissible: true,
      title: 'Which of the rooms on the second floor should I book for the volunteer briefing?',
      options: [
        { value: 'a', label: 'Room 2.04, the long one beside the stairs', description: 'Seats 24, with a projector' },
        { value: 'b', label: 'Room 2.11' },
      ],
    },
    onRespond: fn(),
  },
  decorators: [Story => <div className="w-[220px]"><Story /></div>],
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group');
    await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
  },
};

/** On a dark surface, with the same tokens. */
export const Dark: Story = {
  render: args => (
    <div className="surface-dark flex flex-col gap-3 rounded-lg bg-surface p-4">
      <ChatPrompt {...args} prompt={{ kind: 'confirm', tone: 'danger', title: 'Delete the draft programme?', confirmLabel: 'Delete', declineLabel: 'Keep it' }} />
      <ChatPrompt {...args} prompt={shifts} />
      <ChatPrompt {...args} prompt={{ ...rooms, response: { kind: 'choice', values: ['b'] } }} />
    </div>
  ),
  args: { onRespond: fn() },
};
