import React, { useState } from 'react';

import { Pagination } from '@/components/molecules/Pagination/Pagination';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Pagination component for navigating through pages of data.
 */

const meta: Meta<typeof Pagination> = {
  title: 'Common/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Pagination controls for navigating large datasets.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: 'number',
      description: 'Current active page',
    },
    totalPages: {
      control: 'number',
      description: 'Total number of pages',
    },
    onPageChange: {
      action: 'pageChange',
      description: 'Callback when page changes',
    },
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

const PaginationDefaultStory = () => {
  const [page, setPage] = useState(1);
  return (
    <Pagination
      currentPage={page}
      totalPages={10}
      onPageChange={setPage}
    />
  );
};

export const Default: Story = {
  render: () => <PaginationDefaultStory />,
};

const PaginationManyPagesStory = () => {
  const [page, setPage] = useState(5);
  return (
    <Pagination
      currentPage={page}
      totalPages={50}
      onPageChange={setPage}
    />
  );
};

export const ManyPages: Story = {
  render: () => <PaginationManyPagesStory />,
};
