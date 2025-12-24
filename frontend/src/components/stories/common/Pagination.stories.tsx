import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from '../../components/common/Pagination';
import { ThemeProvider } from '../../context/ThemeContext';
import React, { useState } from 'react';

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
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        currentPage={page}
        totalPages={10}
        onPageChange={setPage}
      />
    );
  },
};

export const ManyPages: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return (
      <Pagination
        currentPage={page}
        totalPages={50}
        onPageChange={setPage}
      />
    );
  },
};
