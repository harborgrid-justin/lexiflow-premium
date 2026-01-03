import { StatusBadge } from '@/components/ui/atoms/StatusBadge/StatusBadge';
import { ThemeProvider } from '@/providers';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from "react";

/**
 * StatusBadge component for displaying status with icons and colors.
 */

const meta: Meta<typeof StatusBadge> = {
  title: 'Common/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Status badge with semantic colors and optional icons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'pending', 'completed', 'cancelled', 'draft'],
      description: 'Status type',
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

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <StatusBadge status="active" />
      <StatusBadge status="pending" />
      <StatusBadge status="completed" />
      <StatusBadge status="cancelled" />
      <StatusBadge status="draft" />
    </div>
  ),
};

export const Active: Story = {
  args: {
    status: 'active',
  },
};

export const Pending: Story = {
  args: {
    status: 'pending',
  },
};

export const Completed: Story = {
  args: {
    status: 'completed',
  },
};
