import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchToolbar } from '../../components/common/SearchToolbar';
import { ThemeProvider } from '../../context/ThemeContext';
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
    showFilters: {
      control: 'boolean',
      description: 'Show filter button',
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

export const WithFilters: Story = {
  render: () => {
    const [query, setQuery] = useState('');
    return (
      <SearchToolbar
        value={query}
        onChange={setQuery}
        placeholder="Search with filters..."
        showFilters={true}
      />
    );
  },
};
