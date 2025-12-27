import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@/components/atoms/Badge';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from "react";

/**
 * Badge component displays status indicators with semantic colors.
 * Supports multiple variants for different use cases.
 */

const meta: Meta<typeof Badge> = {
  title: 'Common/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Status badge with variant colors for displaying labels, statuses, and tags.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'neutral', 'purple'],
      description: 'The visual style of the badge',
    },
    children: {
      control: 'text',
      description: 'The content to display inside the badge',
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

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="purple">Purple</Badge>
    </div>
  ),
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Active',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Pending Review',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Failed',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'New',
  },
};
