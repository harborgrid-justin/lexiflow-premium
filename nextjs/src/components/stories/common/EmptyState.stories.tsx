import { Button } from '@/components/ui/atoms/Button/Button';
import { EmptyState } from '@/components/ui/molecules/EmptyState/EmptyState';
import { ThemeProvider } from '@/providers';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileText, Inbox, Search } from 'lucide-react';
import React from "react";

/**
 * EmptyState component displays helpful messages when there's no content.
 */

const meta: Meta<typeof EmptyState> = {
  title: 'Common/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Empty state component for displaying helpful messages when content is missing.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main title',
    },
    description: {
      control: 'text',
      description: 'Helper text',
    },
    action: {
      control: 'text',
      description: 'Action button or element',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-slate-50 dark:bg-slate-800 min-h-[400px] flex items-center justify-center">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NoDocuments: Story = {
  args: {
    icon: FileText,
    title: 'No documents yet',
    description: 'Get started by uploading your first document.',
    action: <Button>Upload Document</Button>,
  },
};

export const NoResults: Story = {
  args: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
  },
};

export const EmptyInbox: Story = {
  args: {
    icon: Inbox,
    title: 'All caught up!',
    description: 'You have no pending items at this time.',
  },
};
