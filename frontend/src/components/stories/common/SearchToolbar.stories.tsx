import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchToolbar } from '@/components/organisms';
import { ThemeProvider } from '@/providers/ThemeContext';
import React, { useState } from 'react';

/**
 * SearchToolbar component for search with filters.
 */

const meta: Meta<typeof SearchToolbar> = {
  title: 'Common/SearchToolbar',
  component: SearchToolbar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Search toolbar with filtering capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Search query value',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
    },
    actions: {
      control: 'object',
      description: 'Additional action buttons or elements',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onChange: {
      action: 'change',
      description: 'Callback when search query changes',
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
    const [query, setQuery] = useState('');
    return (
      <SearchToolbar
        value={query}
        onChange={setQuery}
        placeholder="Search cases..."
      />
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const [query, setQuery] = useState('');
    return (
      <SearchToolbar
        value={query}
        onChange={setQuery}
        placeholder="Search with actions..."
        actions={
          <>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Filter
            </button>
            <button className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700">
              Export
            </button>
          </>
        }
      />
    );
  },
};
