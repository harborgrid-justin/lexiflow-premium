import { FileText, Inbox, Search } from 'lucide-react';
import React from "react";

import { Button } from '@/components/atoms/Button/Button';
import { EmptyState } from '@/components/molecules/EmptyState/EmptyState';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  }
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
