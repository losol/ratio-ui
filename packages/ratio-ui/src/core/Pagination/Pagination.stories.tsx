import { Meta, StoryFn } from '@storybook/react-vite';
import { Pagination, type PaginationProps } from './Pagination';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  tags: ['autodocs'],
  args: {
    currentPage: 1,
    totalPages: 10,
    onPreviousPageClick: fn(),
    onNextPageClick: fn(),
  },
  argTypes: {
    currentPage: { control: 'number' },
    totalPages: { control: 'number' },
  },
};

export default meta;

type PaginationStory = StoryFn<PaginationProps>;

export const Playground: PaginationStory = args => <Pagination {...args} />;

export const FirstPage: PaginationStory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPreviousPageClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
      onNextPageClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
    />
  );
};

export const MiddlePage: PaginationStory = () => {
  const [currentPage, setCurrentPage] = useState(5);
  const totalPages = 10;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPreviousPageClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
      onNextPageClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
    />
  );
};

export const LastPage: PaginationStory = () => {
  const [currentPage, setCurrentPage] = useState(10);
  const totalPages = 10;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPreviousPageClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
      onNextPageClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
    />
  );
};

export const Interactive: PaginationStory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 20;

  return (
    <div>
      <div className="text-center mb-4">
        <p>Current page: {currentPage} of {totalPages}</p>
        <p className="text-sm text-gray-600">Click the buttons to navigate</p>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPageClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        onNextPageClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      />
    </div>
  );
};

export const FewPages: PaginationStory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPreviousPageClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
      onNextPageClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
    />
  );
};

/** `labels` translates the visible status and the screen-reader names. */
export const Localized: PaginationStory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPreviousPageClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
      onNextPageClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      labels={{
        navigation: 'Sidenavigasjon',
        previous: 'Forrige side',
        next: 'Neste side',
        status: (current, total) => `Side ${current} av ${total}`,
      }}
    />
  );
};
Localized.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole('navigation', { name: 'Sidenavigasjon' })).toBeInTheDocument();
  await expect(canvas.getByRole('button', { name: 'Forrige side' })).toBeDisabled();
  await userEvent.click(canvas.getByRole('button', { name: 'Neste side' }));
  await expect(canvas.getByText('Side 2 av 4')).toBeInTheDocument();
};
