import { SearchToolbar } from '@/shared/ui/organisms/SearchToolbar';
import { ThemeProvider } from '@/features/theme';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

const SearchToolbarDefaultStory = () => {
  const [query, setQuery] = useState('');
  return (
    <SearchToolbar
      value={query}
      onChange={setQuery}
      placeholder="Search cases..."
    />
  );
};

export const Default: Story = {
  render: () => <SearchToolbarDefaultStory />,
};

export const SearchToolbarWithActionsStory = () => {
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
};

const WithButtonsStory = () => {
  return (
    <ThemeProvider>
      <SearchToolbar
        value=""
        onChange={() => { /* Story demo */ }}
        placeholder="Search with buttons"
      />
    </ThemeProvider>
  );
};

export const WithButtons: Story = {
  render: () => <WithButtonsStory />,
};
